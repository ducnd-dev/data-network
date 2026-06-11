"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function ProcessingAlert() {
  return (
    <Alert>
      <div className="flex items-start gap-3">
        <Spinner className="mt-0.5 size-4 shrink-0 text-primary" label="Processing document" />
        <div>
          <AlertTitle>Processing</AlertTitle>
          <AlertDescription>
            Extracting fields from your document. Refresh in a moment if this takes longer than
            expected.
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
