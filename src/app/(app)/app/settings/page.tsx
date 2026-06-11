import { getSessionProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  updateOrganisation,
  updatePassword,
  updateProfile,
} from "@/app/(app)/app/settings/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export const metadata = {
  title: "Settings",
};

const SAVED_MESSAGES: Record<string, string> = {
  profile: "Profile updated.",
  organisation: "Organisation updated.",
  password: "Password updated.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const profile = await getSessionProfile();
  if (!profile) return null;

  const params = await searchParams;
  const isAdmin = profile.role === "admin";
  const orgName = profile.organizations?.name ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, organisation, and account security"
      />

      {params.error && (
        <Alert variant="destructive">
          <AlertDescription>{params.error}</AlertDescription>
        </Alert>
      )}
      {params.saved && SAVED_MESSAGES[params.saved] && (
        <Alert>
          <AlertDescription>{SAVED_MESSAGES[params.saved]}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your display name across the workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile.full_name ?? ""}
                required
              />
            </div>
            <SubmitButton pendingLabel="Saving…">Save profile</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organisation</CardTitle>
          <CardDescription>
            {isAdmin
              ? "Your workspace name shown in the sidebar and dashboard"
              : "Only workspace admins can change the organisation name"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdmin ? (
            <form action={updateOrganisation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organisation name</Label>
                <Input id="orgName" name="orgName" defaultValue={orgName} required />
              </div>
              <SubmitButton pendingLabel="Saving…">Save organisation</SubmitButton>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">{orgName}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Sign-in email and password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled readOnly />
          </div>
          <form action={updatePassword} className="space-y-4 border-t border-border pt-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
            <SubmitButton pendingLabel="Updating…">Update password</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
