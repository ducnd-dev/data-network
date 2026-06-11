import { LegalPage } from "@/components/marketing/LegalPage";
import { BRAND_NAME, SUPPORT_EMAIL } from "@/lib/copy";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description={`Last updated: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`}
    >
      <p>
        {BRAND_NAME} (&quot;we&quot;, &quot;us&quot;) provides invoice OCR software for
        bookkeepers and small businesses. This policy describes how we handle personal
        information in line with the Australian Privacy Act 1988 (Cth).
      </p>

      <h2>Information we collect</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Account details: name, email address, organisation name</li>
        <li>Documents you upload for OCR processing (invoices, receipts, and related files)</li>
        <li>Usage data: page credits consumed, processing status, and billing records</li>
        <li>Technical logs needed to operate and secure the service</li>
      </ul>

      <h2>How we use information</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Provide OCR extraction and display results in your workspace</li>
        <li>Manage subscriptions and usage limits</li>
        <li>Improve reliability, security, and support</li>
      </ul>

      <h2>Storage and security</h2>
      <p>
        Data is stored with cloud infrastructure providers. Documents are scoped to your
        organisation and access is limited to authenticated members of your workspace. We use
        industry-standard measures to protect data in transit and at rest.
      </p>

      <h2>Retention</h2>
      <p>
        We retain account and document data while your account is active. You may request
        deletion of your account and associated documents by contacting us.
      </p>

      <h2>Disclosure</h2>
      <p>
        We do not sell your personal information. We may disclose data to service providers
        who help us operate the platform (for example, hosting, payment processing, and OCR
        processing), subject to appropriate safeguards.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access to or correction of personal information we hold about you.
        Contact us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. Material changes will be posted on this
        page.
      </p>
    </LegalPage>
  );
}
