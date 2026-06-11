"use client";

import { useRef, useState } from "react";
import { uploadDocument } from "@/app/(app)/app/documents/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload } from "lucide-react";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export function DocumentUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const result = await uploadDocument(formData);
      if (result?.error) {
        setError(result.error);
        setPending(false);
      }
    } catch {
      setError("Upload failed. Please try again.");
      setPending(false);
    }
  }

  function validateFile(file: File | null) {
    if (!file || file.size === 0) return "Please select a file.";
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Use PDF, JPEG, PNG, or WebP.";
    }
    if (file.size > MAX_SIZE) return "File must be under 10MB.";
    return null;
  }

  return (
    <form
      action={async (formData) => {
        const file = formData.get("file") as File | null;
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        await handleSubmit(formData);
      }}
      className="space-y-4"
    >
      <div
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (!file || !inputRef.current) return;
          const dt = new DataTransfer();
          dt.items.add(file);
          inputRef.current.files = dt.files;
          setError(validateFile(file));
        }}
      >
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
          onChange={(e) => setError(validateFile(e.target.files?.[0] ?? null))}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Uploading & processing…" : "Upload and extract"}
      </Button>
    </form>
  );
}
