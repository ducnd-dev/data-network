import { BRAND_NAME, BRAND_TAGLINE, getSiteUrl, META_DESCRIPTION } from "@/lib/copy";

export function BrandJsonLd() {
  const siteUrl = getSiteUrl();

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: siteUrl,
    description: META_DESCRIPTION,
    logo: `${siteUrl}/icon.svg`,
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: BRAND_TAGLINE,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "AUD",
    },
    url: siteUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
    </>
  );
}
