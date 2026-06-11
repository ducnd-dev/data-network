-- AI OCR Data Network — Phase 1 schema
create extension if not exists "pgcrypto";

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_subscription_status text,
  billing_email text,
  pages_used_this_period int not null default 0,
  usage_period_start timestamptz not null default date_trunc('month', now()),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  file_key text not null,
  file_name text not null,
  mime_type text not null,
  file_size int not null,
  page_count int not null default 1,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ocr_jobs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider text not null default 'azure',
  model text not null default 'prebuilt-invoice',
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  raw_response jsonb,
  extracted_data jsonb,
  confidence_score numeric,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  event_type text not null default 'ocr_page' check (event_type in ('ocr_page')),
  pages_count int not null default 1,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_profiles_org on public.profiles (organization_id);
create index idx_documents_org on public.documents (organization_id);
create index idx_documents_status on public.documents (organization_id, status);
create index idx_ocr_jobs_document on public.ocr_jobs (document_id);
create index idx_usage_events_org on public.usage_events (organization_id, created_at);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.ocr_jobs enable row level security;
alter table public.usage_events enable row level security;

create or replace function public.user_organization_id()
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "organizations_select_member" on public.organizations
  for select using (id = public.user_organization_id());

create policy "documents_all_org" on public.documents
  for all using (organization_id = public.user_organization_id())
  with check (organization_id = public.user_organization_id());

create policy "ocr_jobs_all_org" on public.ocr_jobs
  for all using (organization_id = public.user_organization_id())
  with check (organization_id = public.user_organization_id());

create policy "usage_events_select_org" on public.usage_events
  for select using (organization_id = public.user_organization_id());
