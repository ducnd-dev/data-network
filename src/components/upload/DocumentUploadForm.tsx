"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type RefObject } from "react";
import { useFormStatus } from "react-dom";
import { uploadDocument } from "@/app/(app)/app/documents/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

function validateFile(file: File | null) {
  if (!file || file.size === 0) return "Please select a file.";
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Use PDF, JPEG, PNG, or WebP.";
  }
  if (file.size > MAX_SIZE) return "File must be under 10MB.";
  return null;
}

function DocumentUploadFields({
  error,
  inputRef,
  isNavigating,
  onValidationError,
}: {
  error: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  isNavigating: boolean;
  onValidationError: (message: string) => void;
}) {
  const { pending } = useFormStatus();
  const busy = pending || isNavigating;

  return (
    <>
      <div
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors",
          busy
            ? "pointer-events-none border-primary/40 bg-primary/5"
            : "hover:border-primary/50 hover:bg-muted/50"
        )}
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          if (busy) return;
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (!file || !inputRef.current) return;
          const dt = new DataTransfer();
          dt.items.add(file);
          inputRef.current.files = dt.files;
          const validationError = validateFile(file);
          onValidationError(validationError ?? "");
        }}
      >
        {busy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/70 backdrop-blur-sm">
            <Spinner className="size-8 text-primary" label="Uploading document" />
            <p className="text-sm font-medium text-foreground">
              {isNavigating ? "Opening document…" : "Uploading & extracting…"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isNavigating ? "Almost done" : "This may take up to a minute"}
            </p>
          </div>
        )}
        <Upload className="mb-3 size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium">Drop invoice or receipt here</p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, JPEG, PNG up to 10MB. Auto-detects type. General documents use 2× credits.
        </p>
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const validationError = validateFile(e.target.files?.[0] ?? null);
            onValidationError(validationError ?? "");
          }}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SubmitButton
        disabled={busy}
        className="w-full"
        pendingLabel="Uploading & processing…"
      >
        Upload and extract
      </SubmitButton>
    </>
  );
}

export function DocumentUploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      aria-busy={isNavigating}
      action={async (formData) => {
        const file = formData.get("file") as File | null;
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }

        setError(null);
        try {
          const result = await uploadDocument(formData);
          if ("error" in result) {
            setError(result.error);
            return;
          }
          startTransition(() => {
            router.push(`/app/documents/${result.documentId}`);
          });
        } catch {
          setError("Upload failed. Please try again.");
        }
      }}
    >
      <DocumentUploadFields
        error={error}
        inputRef={inputRef}
        isNavigating={isNavigating}
        onValidationError={(message) => setError(message || null)}
      />
    </form>
  );
}
