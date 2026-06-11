# Vercel deploy — AI OCR Data Network

## Prerequisites

1. **Supabase Cloud** (not local `127.0.0.1`) — run `SUPABASE_ACCESS_TOKEN=sbp_xxx npm run db:setup:cloud` or create manually
2. **Azure Document Intelligence** — endpoint + key
3. **Cloudflare R2** — bucket for uploads
4. **Vercel account** — https://vercel.com

## Quick deploy

```bash
npm run print:vercel-env    # checklist — fix LOCAL/missing vars first
npx vercel login
npx vercel link             # link to Vercel project (first time)
npm run push:vercel-env     # after .env.local has cloud keys
npm run deploy              # production deploy
```

## Supabase auth URLs (after first deploy)

In Supabase Dashboard → Authentication → URL configuration:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/auth/callback`

## Environment variables (Vercel Production)

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Cloud project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server only |
| `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | Yes | OCR |
| `AZURE_DOCUMENT_INTELLIGENCE_KEY` | Yes | OCR |
| `R2_*` | Yes | File storage |
| `OPENAI_API_KEY` | Recommended | General doc pipeline |
| `STRIPE_*` | Optional | Billing |
| `CRON_SECRET` | Yes | Protects `/api/cron/reset-usage` |

Do **not** set `DATABASE_URL` on Vercel — migrations run separately via `npm run db:migrate`.

## Stripe webhook (production)

1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://your-app.vercel.app/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET` on Vercel

## Cron

`vercel.json` runs monthly usage reset at `/api/cron/reset-usage`. Set `CRON_SECRET` and configure Vercel Cron (Pro plan) or use external cron hitting the endpoint with `Authorization: Bearer $CRON_SECRET`.

## Commands

| Command | Description |
|---------|-------------|
| `npm run print:vercel-env` | Env checklist |
| `npm run push:vercel-env` | Push `.env.local` → Vercel |
| `npm run deploy` | `vercel deploy --prod` |
| `npm run deploy:preview` | Preview deploy |
