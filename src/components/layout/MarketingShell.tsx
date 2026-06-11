import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { Logo } from "@/components/brand/Logo";
import { Separator } from "@/components/ui/separator";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/copy";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="mt-auto border-t border-border/60 bg-gradient-to-b from-card/30 to-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <Link href="/" className="inline-block transition-opacity hover:opacity-80">
                <Logo />
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {BRAND_TAGLINE}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3 sm:gap-12">
              <div>
                <p className="font-display font-semibold">Product</p>
                <ul className="mt-3 space-y-2.5 text-muted-foreground">
                  <li>
                    <Link href="/pricing" className="transition-colors hover:text-foreground">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="transition-colors hover:text-foreground">
                      Sign up
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-display font-semibold">Legal</p>
                <ul className="mt-3 space-y-2.5 text-muted-foreground">
                  <li>
                    <Link href="/privacy" className="transition-colors hover:text-foreground">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="transition-colors hover:text-foreground">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-display font-semibold">Support</p>
                <ul className="mt-3 space-y-2.5 text-muted-foreground">
                  <li>
                    <Link href="/contact" className="transition-colors hover:text-foreground">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="transition-colors hover:text-foreground">
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <Separator className="my-8 opacity-60" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {BRAND_NAME}. Invoice OCR SaaS.
          </p>
        </div>
      </footer>
    </div>
  );
}
