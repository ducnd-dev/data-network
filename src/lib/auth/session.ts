import { createClient } from "@/lib/supabase/server";

export type UserProfile = {
  id: string;
  full_name: string | null;
  organization_id: string;
  role: string;
  organizations: {
    id: string;
    name: string;
    plan: string;
    pages_used_this_period: number;
  } | null;
};

export async function getSessionProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, organization_id, role, organizations(id, name, plan, pages_used_this_period)"
    )
    .eq("id", user.id)
    .single();
  if (!data) return null;
  const org = data.organizations as unknown as UserProfile["organizations"];
  return {
    id: data.id,
    full_name: data.full_name,
    organization_id: data.organization_id,
    role: data.role,
    organizations: org,
  };
}

export async function requireProfile() {
  return getSessionProfile();
}
