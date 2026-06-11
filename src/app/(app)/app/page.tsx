import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";
import { getOrgUsage } from "@/lib/usage/limits";
import { monthlyPageLimit, planLabel } from "@/lib/billing/plans";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { StatCard } from "@/components/app/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CREDITS_RESET_HINT } from "@/lib/copy";
import { CreditCard, FileText, Upload, Zap } from "lucide-react";

function startOfMonthIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export default async function DashboardPage() {
  const profile = await getSessionProfile();
  if (!profile) return null;

  const usage = await getOrgUsage(profile.organization_id);
  const usagePercent = Math.min(100, Math.round((usage.used / usage.limit) * 100));
  const plan = profile.organizations?.plan ?? "free";

  const supabase = await createClient();
  const monthStart = startOfMonthIso();

  const [{ data: documents }, { count: documentsThisMonth }] = supabase
    ? await Promise.all([
        supabase
          .from("documents")
          .select("id, file_name, status, created_at")
          .eq("organization_id", profile.organization_id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("documents")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id)
          .gte("created_at", monthStart),
      ])
    : [{ data: [] }, { count: 0 }];

  const totalDocuments = documents?.length ?? 0;
  const hasDocuments = totalDocuments > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`${profile.organizations?.name ?? "Workspace"} — ${planLabel(plan)} plan`}
        action={
          <Button asChild>
            <Link href="/app/documents/new">
              <Upload className="size-4" aria-hidden />
              Upload document
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Page credits"
          description={`${usage.used} of ${usage.limit} used. ${CREDITS_RESET_HINT}`}
          icon={Zap}
        >
          <Progress value={usagePercent} />
          {usagePercent >= 80 && (
            <p className="mt-3 text-sm text-amber-700">
              Approaching limit.{" "}
              <Link href="/app/billing" className="underline">
                Upgrade plan
              </Link>
            </p>
          )}
        </StatCard>

        <StatCard
          title="Documents this month"
          description="Invoices and receipts uploaded since the 1st"
          icon={FileText}
        >
          <p className="font-display text-3xl font-semibold tracking-tight">
            {documentsThisMonth ?? 0}
          </p>
          <Button variant="link" className="mt-2 h-auto p-0" asChild>
            <Link href="/app/documents">View all documents</Link>
          </Button>
        </StatCard>

        <StatCard
          title="Current plan"
          description={`${monthlyPageLimit(plan).toLocaleString()} page credits per month`}
          icon={CreditCard}
        >
          <Badge variant={plan === "free" ? "secondary" : "success"}>
            {planLabel(plan)}
          </Badge>
          {plan === "free" && (
            <p className="mt-3 text-sm text-muted-foreground">
              Upgrade to Pro for 500 page credits per month.{" "}
              <Link href="/app/billing" className="text-primary underline">
                Compare plans
              </Link>
            </p>
          )}
        </StatCard>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent documents</CardTitle>
            <CardDescription>Latest invoice uploads</CardDescription>
          </div>
          {hasDocuments && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/documents">View all</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!hasDocuments ? (
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Upload your first invoice to see extracted fields, confidence scores, and export options."
              actionLabel="Upload your first invoice"
              actionHref="/app/documents/new"
              steps={[
                "Upload a PDF or image of an invoice or receipt",
                "Review extracted vendor, dates, and line items",
                "Download JSON or CSV for your bookkeeping workflow",
              ]}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents!.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Link
                        href={`/app/documents/${doc.id}`}
                        className="font-medium hover:underline"
                      >
                        {doc.file_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          doc.status === "completed"
                            ? "success"
                            : doc.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(doc.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
