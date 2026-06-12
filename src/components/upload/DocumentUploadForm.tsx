"use client";

import { FileText, Upload, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { uploadDocument } from "@/app/(app)/app/documents/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Spinner } from "@/components/ui/spinner";
import { cn, formatBytes } from "@/lib/utils";

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

function useFilePreview(file: File | null) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return previewUrl;
}

function FilePreview({
  file,
  previewUrl,
  onClear,
  disabled,
}: {
  file: File;
  previewUrl: string;
  onClear: () => void;
  disabled: boolean;
}) {
  const isPdf = file.type === "application/pdf";
  const isImage = file.type.startsWith("image/");

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative overflow-hidden rounded-lg border border-border bg-background">
        {isImage && (
          // eslint-disable-next-line @next/next/no-img-element -- blob URL preview before upload
          <img
            src={previewUrl}
            alt={`Preview of ${file.name}`}
            className="mx-auto max-h-64 w-full object-contain"
          />
        )}
        {isPdf && (
          <iframe
            src={previewUrl}
            title={`Preview of ${file.name}`}
            className="h-64 w-full bg-white"
          />
        )}
        {!isImage && !isPdf && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="size-10" aria-hidden />
            <p className="text-sm">Preview unavailable</p>
          </div>
        )}
        {!disabled && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 size-7 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            aria-label="Remove file"
          >
            <X className="size-4" aria-hidden />
          </Button>
        )}
      </div>
      <div className="text-left">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
      </div>
    </div>
  );
}

export function DocumentUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, isPending] = useActionState(uploadDocument, null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const previewUrl = useFilePreview(selectedFile);

  const error = validationError ?? state?.error ?? null;

  function applyFile(file: File | null) {
    if (!file) {
      setSelectedFile(null);
      setValidationError(null);
      return;
    }
    const message = validateFile(file);
    setValidationError(message);
    setSelectedFile(message ? null : file);
  }

  function clearFile() {
    if (inputRef.current) inputRef.current.value = "";
    setSelectedFile(null);
    setValidationError(null);
  }

  return (
    <form
      action={formAction}
      className="space-y-4"
      aria-busy={isPending}
      onSubmit={(e) => {
        const file = inputRef.current?.files?.[0] ?? null;
        const message = validateFile(file);
        if (message) {
          e.preventDefault();
          setValidationError(message);
          return;
        }
        setValidationError(null);
      }}
    >
      <div
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center transition-colors",
          isPending
            ? "pointer-events-none border-primary/40 bg-primary/5"
            : "hover:border-primary/50 hover:bg-muted/50",
          selectedFile && "cursor-default py-6"
        )}
        onClick={() => {
          if (!isPending && !selectedFile) inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          if (isPending) return;
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (!file || !inputRef.current) return;
          const dt = new DataTransfer();
          dt.items.add(file);
          inputRef.current.files = dt.files;
          applyFile(file);
        }}
      >
        {isPending && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/70 backdrop-blur-sm">
            <Spinner className="size-8 text-primary" label="Uploading document" />
            <p className="text-sm font-medium text-foreground">Uploading & extracting…</p>
            <p className="text-xs text-muted-foreground">This may take up to a minute</p>
          </div>
        )}

        {selectedFile && previewUrl ? (
          <FilePreview
            file={selectedFile}
            previewUrl={previewUrl}
            onClear={clearFile}
            disabled={isPending}
          />
        ) : (
          <>
            <Upload className="mb-3 size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">Drop invoice or receipt here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, JPEG, PNG up to 10MB. Auto-detects type. General documents use 2× credits.
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          name="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          disabled={isPending}
          onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {selectedFile && !isPending && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          Choose a different file
        </Button>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SubmitButton
        disabled={isPending || !selectedFile}
        pending={isPending}
        className="w-full"
        pendingLabel="Uploading & processing…"
      >
        Upload and extract
      </SubmitButton>
    </form>
  );
}
