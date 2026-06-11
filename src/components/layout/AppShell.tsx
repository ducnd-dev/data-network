"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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

function NavLink({
  item,
  pathname,
  layoutId,
}: {
  item: (typeof navItems)[number];
  pathname: string;
  layoutId?: string;
}) {
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link href={item.href} className="relative block">
      {active && layoutId && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-lg bg-primary shadow-md shadow-primary/20"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span
        className={cn(
          "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
          active
            ? layoutId
              ? "text-primary-foreground"
              : "text-primary"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className={layoutId ? undefined : "sr-only md:not-sr-only"}>{item.label}</span>
      </span>
    </Link>
  );
}

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
    <div className="flex min-h-screen bg-gradient-to-br from-muted/40 via-background to-muted/20">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl md:flex">
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
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} layoutId="nav-active" />
          ))}
        </nav>
        <form action={signOut} className="border-t border-border p-3">
          <Button type="submit" variant="outline" size="sm" className="w-full gap-2">
            <LogOut className="size-3.5" aria-hidden />
            Sign out
          </Button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link href="/app" className="md:hidden">
              <Logo compact />
            </Link>
            <p className="text-sm text-muted-foreground">
              <span className="hidden sm:inline">Signed in as </span>
              <span className="font-medium text-foreground">
                {profile.full_name ?? "User"}
              </span>
            </p>
          </div>
        </header>
        <div className="flex-1 px-4 py-6 md:px-8">{children}</div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <div key={item.href} className="flex flex-1 justify-center p-2">
            <NavLink item={item} pathname={pathname} />
          </div>
        ))}
      </nav>
    </div>
  );
}
