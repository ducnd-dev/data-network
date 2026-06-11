import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";
import { getOrgUsage } from "@/lib/usage/limits";
import { monthlyPageLimit, planLabel } from "@/lib/billing/plans";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
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
import { Upload } from "lucide-react";

export default async function DashboardPage() {
  const profile = await getSessionProfile();
  if (!profile) return null;

  const usage = await getOrgUsage(profile.organization_id);
  const usagePercent = Math.min(100, Math.round((usage.used / usage.limit) * 100));
  const plan = profile.organizations?.plan ?? "free";

  const supabase = await createClient();
  const { data: documents } = supabase
    ? await supabase
        .from("documents")
        .select("id, file_name, status, created_at")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {profile.organizations?.name ?? "Workspace"} — {planLabel(plan)} plan
          </p>
        </div>
        <Button asChild>
          <Link href="/app/documents/new">
            <Upload className="size-4" aria-hidden />
            Upload invoice
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage this month</CardTitle>
            <CardDescription>
              {usage.used} of {usage.limit} page credits used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={usagePercent} />
            {usagePercent >= 80 && (
              <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
                Approaching limit.{" "}
                <Link href="/app/billing" className="underline">
                  Upgrade plan
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>{monthlyPageLimit(plan)} pages per month</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={plan === "free" ? "secondary" : "success"}>
              {planLabel(plan)}
            </Badge>
            {plan === "free" && (
              <p className="mt-3 text-sm text-muted-foreground">
                Upgrade to Pro for 500 pages/month.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent documents</CardTitle>
            <CardDescription>Latest invoice uploads</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/documents">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!documents?.length ? (
            <p className="text-sm text-muted-foreground">
              No documents yet.{" "}
              <Link href="/app/documents/new" className="text-primary underline">
                Upload your first invoice
              </Link>
            </p>
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
                {documents.map((doc) => (
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
