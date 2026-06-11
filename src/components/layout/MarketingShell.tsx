import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { Logo } from "@/components/brand/Logo";
import { Separator } from "@/components/ui/separator";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="mt-auto border-t border-border/60 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <Link href="/">
                <Logo />
              </Link>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Multi-tenant invoice OCR SaaS powered by Azure Document Intelligence.
              </p>
            </div>
            <div className="flex gap-10 text-sm">
              <div>
                <p className="font-medium">Product</p>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  <li>
                    <Link href="/pricing">Pricing</Link>
                  </li>
                  <li>
                    <Link href="/signup">Sign up</Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Account</p>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  <li>
                    <Link href="/login">Sign in</Link>
                  </li>
                  <li>
                    <Link href="/app">Dashboard</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AI OCR Data Network. Phase 1 — Invoice OCR SaaS.
          </p>
        </div>
      </footer>
    </div>
  );
}
