#!/usr/bin/env node
/**
 * Seed a workspace admin with Business plan for full feature access.
 *
 *   npm run db:seed
 *
 * Optional env (or add to .env.local):
 *   SEED_ADMIN_EMAIL=admin@data-network.app
 *   SEED_ADMIN_PASSWORD=DataNetworkAdmin2026!
 *   SEED_ADMIN_NAME=Workspace Admin
 *   SEED_ORG_NAME=My Organisation
 *   SEED_ORG_PLAN=business   # free | pro | business
 */
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const email = process.env.SEED_ADMIN_EMAIL?.trim() || "admin@data-network.app";
const password = process.env.SEED_ADMIN_PASSWORD?.trim() || "DataNetworkAdmin2026!";
const fullName = process.env.SEED_ADMIN_NAME?.trim() || "Workspace Admin";
const orgName = process.env.SEED_ORG_NAME?.trim() || "My Organisation";
const orgPlan = process.env.SEED_ORG_PLAN?.trim() || "business";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const databaseUrl = process.env.DATABASE_URL?.trim();
const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();

function orgSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
}

function projectRefFromUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0];
  } catch {
    return null;
  }
}

async function fetchServiceRoleKey() {
  const existing = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (existing) return existing;

  if (!accessToken || !supabaseUrl) return null;
  const ref = projectRefFromUrl(supabaseUrl);
  if (!ref) return null;

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return null;

  const keys = await res.json();
  return (
    keys.find((k) => k.name === "service_role")?.api_key ??
    keys.find((k) => k.type === "secret")?.api_key ??
    null
  );
}

async function findUserIdByEmail(emailAddress) {
  if (!databaseUrl) return null;
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select id from auth.users where lower(email) = lower($1)`,
      [emailAddress]
    );
    return rows[0]?.id ?? null;
  } finally {
    await client.end();
  }
}

async function purgeAuthUserByEmail(emailAddress) {
  if (!databaseUrl) return null;
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select id from auth.users where lower(email) = lower($1)`,
      [emailAddress]
    );
    const userId = rows[0]?.id;
    if (!userId) return null;

    await client.query(`delete from public.profiles where id = $1`, [userId]);
    await client.query(`delete from auth.identities where user_id = $1`, [userId]);
    await client.query(`delete from auth.users where id = $1`, [userId]);
    console.log(`  purged broken auth user (${userId})`);
    return userId;
  } finally {
    await client.end();
  }
}

async function removeBrokenAuthUser(admin, userId) {
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (!error) {
    console.log(`  removed auth user via API (${userId})`);
    return;
  }

  if (!databaseUrl) {
    throw new Error(`deleteUser: ${error.message}`);
  }

  console.log(`  Admin API delete failed — purging via SQL…`);
  await purgeAuthUserByEmail(email);
}

async function upsertOrgAndProfile(admin, userId) {
  const slug = orgSlug(orgName);

  const { data: existingOrg } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  let orgId = existingOrg?.id;

  if (!orgId) {
    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({ name: orgName, slug, plan: orgPlan })
      .select("id")
      .single();
    if (orgError) throw new Error(`create org: ${orgError.message}`);
    orgId = org.id;
    console.log(`  created organization`);
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!existingProfile) {
    const { error: profileError } = await admin.from("profiles").insert({
      id: userId,
      organization_id: orgId,
      full_name: fullName,
      role: "admin",
    });
    if (profileError) throw new Error(`create profile: ${profileError.message}`);
    console.log(`  created admin profile`);
  } else {
    const { error: profileError } = await admin
      .from("profiles")
      .update({ organization_id: orgId, full_name: fullName, role: "admin" })
      .eq("id", userId);
    if (profileError) throw new Error(`update profile: ${profileError.message}`);
    console.log(`  updated admin profile`);
  }

  const { error: orgUpdateError } = await admin
    .from("organizations")
    .update({
      plan: orgPlan,
      pages_used_this_period: 0,
      usage_period_start: new Date().toISOString(),
      name: orgName,
    })
    .eq("id", orgId);

  if (orgUpdateError) throw new Error(`update org: ${orgUpdateError.message}`);

  return orgId;
}

async function seedViaAdminApi(serviceKey) {
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const existingUserId = await findUserIdByEmail(email);

  if (existingUserId) {
    // SQL-seeded users break GoTrue — purge and recreate via Admin API.
    await removeBrokenAuthUser(admin, existingUserId);
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    throw new Error(`createUser: ${error.message}`);
  }

  const userId = data.user.id;
  console.log(`  created auth user: ${email}`);

  const orgId = await upsertOrgAndProfile(admin, userId);
  return { userId, orgId };
}

async function seedViaPostgresOnly() {
  throw new Error(
    "Direct SQL user creation is disabled (breaks Supabase Auth login). " +
      "Add a valid SUPABASE_SERVICE_ROLE_KEY (JWT from Dashboard → Settings → API)."
  );
}

async function main() {
  console.log("=== Seed admin account ===\n");

  if (!supabaseUrl && !databaseUrl) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL or DATABASE_URL in .env.local");
    process.exit(1);
  }

  const serviceKey = await fetchServiceRoleKey();

  if (!serviceKey?.startsWith("eyJ")) {
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY must be the service_role JWT from Supabase Dashboard → Settings → API.\n" +
        "  (starts with eyJ… — not the sb_secret_ key alone if invalid)"
    );
    process.exit(1);
  }

  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is required for Admin API seed");
    process.exit(1);
  }

  console.log("Using Supabase Admin API…");
  let result;

  try {
    result = await seedViaAdminApi(serviceKey);
  } catch (error) {
    if (databaseUrl && String(error.message).includes("Invalid API key")) {
      console.error("\nInvalid SUPABASE_SERVICE_ROLE_KEY. Use the service_role JWT from Supabase Dashboard.");
    }
    throw error;
  }

  console.log("\n=== Done ===");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Plan:     ${orgPlan} (admin role, usage reset to 0)`);
  console.log(`  Org:      ${orgName}`);
  console.log(`  User ID:  ${result.userId}`);
  console.log(`  Org ID:   ${result.orgId}`);
  console.log("\nSign in at /login");
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
