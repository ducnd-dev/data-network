"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  exportFileBaseName,
  toCsvBlob,
  toJsonBlob,
} from "@/lib/export/document-export";
import type { DocumentType, ExtractedDocument } from "@/lib/ocr/types";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExportDataButtons({
  extracted,
  fileName,
  documentType,
}: {
  extracted: ExtractedDocument;
  fileName: string;
  documentType?: DocumentType | null;
}) {
  const base = exportFileBaseName(fileName);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => downloadBlob(toJsonBlob(extracted), `${base}-extracted.json`)}
      >
        <Download className="size-3.5" aria-hidden />
        Download JSON
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() =>
          downloadBlob(toCsvBlob(extracted, documentType), `${base}-extracted.csv`)
        }
      >
        <Download className="size-3.5" aria-hidden />
        Download CSV
      </Button>
    </div>
  );
}
