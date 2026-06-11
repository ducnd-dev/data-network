alter table public.organizations
  drop column if exists stripe_customer_id,
  drop column if exists stripe_subscription_id,
  drop column if exists stripe_subscription_status;

alter table public.organizations
  drop column if exists square_customer_id,
  drop column if exists square_subscription_id,
  drop column if exists square_subscription_status,
  drop column if exists square_pending_order_id,
  drop column if exists square_pending_plan;

alter table public.organizations
  add column if not exists polar_customer_id text,
  add column if not exists polar_subscription_id text,
  add column if not exists polar_subscription_status text;

drop table if exists public.stripe_webhook_events;
drop table if exists public.square_webhook_events;
