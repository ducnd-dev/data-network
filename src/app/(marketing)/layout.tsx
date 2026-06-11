import { MarketingShell } from "@/components/layout/MarketingShell";
import { BrandJsonLd } from "@/components/brand/BrandJsonLd";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BrandJsonLd />
      <MarketingShell>{children}</MarketingShell>
    </>
  );
}
