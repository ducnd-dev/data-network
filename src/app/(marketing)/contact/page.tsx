import Link from "next/link";
import { LegalPage } from "@/components/marketing/LegalPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_NAME, SUPPORT_EMAIL } from "@/lib/copy";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact support"
      description="We're here to help with account, billing, and document processing questions."
    >
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="font-display text-lg">Email us</CardTitle>
          <CardDescription>Typical response within 1–2 business days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            For support, billing, or privacy requests, email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
          <Button asChild>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${BRAND_NAME} support`)}`}>
              Send email
            </a>
          </Button>
        </CardContent>
      </Card>

      <h2 className="mt-10">Common topics</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Upload or processing errors — include the file name and approximate upload time</li>
        <li>Billing and plan upgrades — include your workspace name</li>
        <li>Account access — include the email address you signed up with</li>
      </ul>

      <p className="mt-6">
        See also{" "}
        <Link href="/pricing" className="text-primary hover:underline">
          pricing
        </Link>
        ,{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          privacy policy
        </Link>
        , and{" "}
        <Link href="/terms" className="text-primary hover:underline">
          terms of service
        </Link>
        .
      </p>
    </LegalPage>
  );
}
