import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth/session";
import { isAzureOcrConfigured } from "@/lib/ocr/azure";
import { runDocumentPipeline } from "@/lib/ocr/run-pipeline";
import { createAdminClient } from "@/lib/supabase/admin";
import { downloadFromR2 } from "@/lib/storage/r2";
import { getOrgUsage, recordOcrUsage } from "@/lib/usage/limits";

export const runtime = "nodejs";

const bodySchema = z.object({
  documentId: z.string().uuid(),
});

export async function POST(request: Request) {
  const profile = await requireProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAzureOcrConfigured()) {
    return NextResponse.json({ error: "OCR not configured" }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const plan = profile.organizations?.plan ?? "free";
  const usage = await getOrgUsage(profile.organization_id);

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { data: document } = await admin
    .from("documents")
    .select("id, file_key, mime_type, file_name, organization_id")
    .eq("id", parsed.data.documentId)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const { data: job } = await admin
    .from("ocr_jobs")
    .insert({
      document_id: document.id,
      organization_id: profile.organization_id,
      status: "processing",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (!job) {
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }

  try {
    await admin.from("documents").update({ status: "processing" }).eq("id", document.id);

    const buffer = await downloadFromR2(document.file_key);
    const result = await runDocumentPipeline({
      buffer,
      mimeType: document.mime_type,
      fileName: document.file_name,
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

    return NextResponse.json({
      jobId: job.id,
      documentType: result.documentType,
      creditsCharged: result.creditsCharged,
      extracted: result.extracted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OCR failed";
    await admin
      .from("ocr_jobs")
      .update({
        status: "failed",
        error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    await admin.from("documents").update({ status: "failed" }).eq("id", document.id);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
