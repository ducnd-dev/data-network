"use server";

import { randomUUID } from "crypto";
import { requireProfile } from "@/lib/auth/session";
import { isAzureOcrConfigured } from "@/lib/ocr/azure";
import { runDocumentPipeline } from "@/lib/ocr/run-pipeline";
import { createAdminClient } from "@/lib/supabase/admin";
import { isR2Configured, uploadToR2 } from "@/lib/storage/r2";
import { USER_ERRORS } from "@/lib/errors/user-messages";
import { canProcessOcr, getOrgUsage, recordOcrUsage } from "@/lib/usage/limits";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function uploadDocument(
  formData: FormData
): Promise<{ error: string } | { documentId: string }> {
  const profile = await requireProfile();
  if (!profile) return { error: "Not signed in" };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file selected" };
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { error: "Use PDF, JPEG, PNG, or WebP" };
  }
  if (file.size > MAX_SIZE) return { error: "File must be under 10MB" };

  if (!isR2Configured()) {
    return { error: USER_ERRORS.R2_NOT_CONFIGURED };
  }

  if (!isAzureOcrConfigured()) {
    return { error: USER_ERRORS.AZURE_NOT_CONFIGURED };
  }

  const plan = profile.organizations?.plan ?? "free";
  const usage = await getOrgUsage(profile.organization_id);
  const precheck = await canProcessOcr(profile.organization_id, 1);
  if (!precheck.allowed) return { error: precheck.reason ?? "Usage limit reached" };

  const admin = createAdminClient();
  if (!admin) return { error: USER_ERRORS.DATABASE_NOT_CONFIGURED };

  const documentId = randomUUID();
  const ext =
    file.type === "application/pdf"
      ? "pdf"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
  const fileKey = `${profile.organization_id}/${documentId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data: document, error: docError } = await admin
    .from("documents")
    .insert({
      id: documentId,
      organization_id: profile.organization_id,
      uploaded_by: profile.id,
      file_key: fileKey,
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      status: "classifying",
    })
    .select("id")
    .single();

  if (docError || !document) {
    return { error: docError?.message ?? "Failed to create document" };
  }

  const { data: job, error: jobError } = await admin
    .from("ocr_jobs")
    .insert({
      document_id: document.id,
      organization_id: profile.organization_id,
      status: "processing",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (jobError || !job) {
    await admin.from("documents").update({ status: "failed" }).eq("id", document.id);
    return { error: jobError?.message ?? "Failed to create OCR job" };
  }

  try {
    await uploadToR2({
      key: fileKey,
      body: buffer,
      contentType: file.type,
    });

    await admin
      .from("documents")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", document.id);

    const result = await runDocumentPipeline({
      buffer,
      mimeType: file.type,
      fileName: file.name,
      plan,
      creditsRemaining: usage.remaining,
    });

    await admin
      .from("ocr_jobs")
      .update({
        status: "completed",
        model: result.pipeline.azureModel,
        pipeline_id: result.pipeline.id,
        credit_multiplier: result.pipeline.creditMultiplier,
        credits_charged: result.creditsCharged,
        estimated_cogs_aud: result.estimatedCogsAud,
        llm_tokens_in: result.llmTokensIn ?? null,
        llm_tokens_out: result.llmTokensOut ?? null,
        raw_response: result.raw as Record<string, unknown>,
        extracted_data: result.extracted,
        confidence_score: result.confidenceScore,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    await admin
      .from("documents")
      .update({
        status: "completed",
        page_count: result.pageCount,
        document_type: result.documentType,
        classification_confidence: result.classification.confidence,
        classification_source: result.classification.source,
        updated_at: new Date().toISOString(),
      })
      .eq("id", document.id);

    await recordOcrUsage(
      profile.organization_id,
      {
        document_id: document.id,
        document_type: result.documentType,
        pipeline_id: result.pipeline.id,
        credit_multiplier: result.pipeline.creditMultiplier,
        pages_count: result.pageCount,
        credits_charged: result.creditsCharged,
      },
      result.creditsCharged
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "OCR processing failed";
    await admin
      .from("ocr_jobs")
      .update({
        status: "failed",
        error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    await admin
      .from("documents")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", document.id);
    return { error: message };
  }

  return { documentId: document.id };
}
