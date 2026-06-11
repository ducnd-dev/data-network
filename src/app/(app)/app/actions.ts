"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData): Promise<{ error: string } | void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const orgName = String(formData.get("orgName") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    return { error: "Supabase is not configured. Add keys to .env.local" };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Sign up failed" };

  const slug = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name: orgName, slug })
    .select("id")
    .single();
  if (orgError) return { error: orgError.message };

  const { error: profileError } = await admin.from("profiles").insert({
    id: authData.user.id,
    organization_id: org.id,
    full_name: fullName,
    role: "admin",
  });
  if (profileError) return { error: profileError.message };

  redirect("/app");
}

export async function signIn(formData: FormData): Promise<{ error: string } | void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured" };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/app");
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
