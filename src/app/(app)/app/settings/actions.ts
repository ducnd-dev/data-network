"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function settingsRedirect(params: Record<string, string>): never {
  const query = new URLSearchParams(params).toString();
  redirect(`/app/settings?${query}`);
}

export async function updateProfile(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) {
    settingsRedirect({ error: "Full name is required." });
  }

  const supabase = await createClient();
  if (!supabase) settingsRedirect({ error: "The service is temporarily unavailable." });

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", profile.id);

  if (error) settingsRedirect({ error: "Could not update profile. Please try again." });

  revalidatePath("/app/settings");
  settingsRedirect({ saved: "profile" });
}

export async function updateOrganisation(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");

  if (profile.role !== "admin") {
    settingsRedirect({ error: "Only workspace admins can rename the organisation." });
  }

  const orgName = String(formData.get("orgName") ?? "").trim();
  if (!orgName) {
    settingsRedirect({ error: "Organisation name is required." });
  }

  const supabase = await createClient();
  if (!supabase) settingsRedirect({ error: "The service is temporarily unavailable." });

  const { error } = await supabase
    .from("organizations")
    .update({ name: orgName })
    .eq("id", profile.organization_id);

  if (error) settingsRedirect({ error: "Could not update organisation. Please try again." });

  revalidatePath("/app/settings");
  revalidatePath("/app");
  settingsRedirect({ saved: "organisation" });
}

export async function updatePassword(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    settingsRedirect({ error: "Password must be at least 8 characters." });
  }

  if (password !== confirmPassword) {
    settingsRedirect({ error: "Passwords do not match." });
  }

  const supabase = await createClient();
  if (!supabase) settingsRedirect({ error: "The service is temporarily unavailable." });

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    settingsRedirect({ error: "Could not update password. Please try again." });
  }

  settingsRedirect({ saved: "password" });
}
