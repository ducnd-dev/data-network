create table public.stripe_webhook_events (
  id text primary key,
  created_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;
