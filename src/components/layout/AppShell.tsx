"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(app)/app/actions";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/auth/session";
import { planLabel } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";
import { CreditCard, FileText, LayoutDashboard, LogOut, Upload } from "lucide-react";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/documents", label: "Documents", icon: FileText },
  { href: "/app/documents/new", label: "Upload", icon: Upload },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
];

export function AppShell({
  profile,
  children,
}: {
  profile: UserProfile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const plan = profile.organizations?.plan ?? "free";
  const orgName = profile.organizations?.name ?? "Workspace";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border px-5 py-5">
          <Link href="/app">
            <Logo compact />
          </Link>
          <p className="mt-3 truncate text-sm font-medium">{orgName}</p>
          <Badge variant={plan === "free" ? "secondary" : "success"} className="mt-2">
            {planLabel(plan)}
          </Badge>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={signOut} className="border-t border-border p-3">
          <Button type="submit" variant="outline" size="sm" className="w-full gap-2">
            <LogOut className="size-3.5" aria-hidden />
            Sign out
          </Button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-8">
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {profile.full_name ?? "User"}
            </span>
          </p>
        </header>
        <div className="flex-1 px-4 py-6 md:px-8">{children}</div>
      </div>
    </div>
  );
}
