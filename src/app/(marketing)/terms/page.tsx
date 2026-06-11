import { LegalPage } from "@/components/marketing/LegalPage";
import { BRAND_NAME, SUPPORT_EMAIL } from "@/lib/copy";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description={`Last updated: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`}
    >
      <p>
        By using {BRAND_NAME}, you agree to these terms. If you do not agree, do not use the
        service.
      </p>

      <h2>Service</h2>
      <p>
        {BRAND_NAME} provides automated extraction of data from uploaded documents. Results are
        provided for review — you are responsible for verifying accuracy before use in
        accounting or compliance workflows.
      </p>

      <h2>Accounts</h2>
      <p>
        You must provide accurate registration information and keep your credentials secure.
        Workspace admins are responsible for activity under their organisation account.
      </p>

      <h2>Acceptable use</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Upload only documents you have the right to process</li>
        <li>Do not attempt to disrupt, reverse engineer, or abuse the service</li>
        <li>Do not upload malicious files or unlawful content</li>
      </ul>

      <h2>Billing</h2>
      <p>
        Paid plans are billed monthly in AUD unless stated otherwise. Page credits reset on the
        1st of each calendar month. Subscriptions may be canceled through the billing portal
        where available. Refunds are handled at our discretion unless required by law.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The service is provided &quot;as is&quot;. We do not guarantee that OCR results will be
        error-free. To the extent permitted by law, we limit liability for indirect or
        consequential loss arising from use of the service.
      </p>

      <h2>Termination</h2>
      <p>
        We may suspend or terminate access for breach of these terms. You may stop using the
        service at any time.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </LegalPage>
  );
}
