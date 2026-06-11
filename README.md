# AI OCR Data Network

Multi-tenant invoice OCR SaaS — Phase 1 of a 6-phase platform.

Upload invoices and receipts, extract structured data via **Azure Document Intelligence**, review results in a dashboard, and manage usage with **Polar** billing.

## Roadmap

| Phase | Feature |
|-------|---------|
| 1 | OCR SaaS (this release) |
| 2 | AI OCR + Export (CSV, JSON, Excel, Xero) |
| 3 | Human Verify queue |
| 4 | Data Network API |
| 5 | Marketplace |
| 6 | AI To Earn |

## Tech stack

- **Next.js 16** App Router + React 19
- **Supabase** — auth, Postgres, RLS multi-tenant
- **Azure Document Intelligence** — prebuilt-invoice model
- **Cloudflare R2** — document storage
- **Polar** — subscriptions + webhooks
- **Vercel** — deployment + cron

## Getting started

### Option A — Local Supabase (tự động, cần Docker)

```bash
npm install
npm run setup:env
npm run db:setup      # starts Docker Supabase + applies migrations + writes .env.local
npm run dev
```

Studio: http://127.0.0.1:54323

### Option B — Supabase Cloud (tự động)

1. Tạo token tại https://supabase.com/dashboard/account/tokens
2. Chạy:

```bash
SUPABASE_ACCESS_TOKEN=sbp_xxx npm run db:setup:cloud
npm run dev
```

### Option C — Manual

```bash
cp .env.example .env.local
# Fill in Supabase, Azure, R2, and Polar keys
DATABASE_URL="postgresql://..." npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Production:** https://data-network.vercel.app — see [docs/DEPLOY.md](docs/DEPLOY.md) for env setup.

## Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin operations |
| `AZURE_DOCUMENT_INTELLIGENCE_*` | Invoice OCR |
| `R2_*` | Document file storage |
| `POLAR_*` | Billing |
| `CRON_SECRET` | Protect usage reset endpoint |

## Database

Migrations live in [`supabase/migrations/`](supabase/migrations/).

```bash
DATABASE_URL="postgresql://..." npm run db:migrate
```

## Document classification & credits

Upload flow auto-classifies documents (heuristics + optional GPT-4o-mini vision), routes to the best Azure model, and charges page credits:

| Type | Pipeline | Credits/page |
|------|----------|--------------|
| Invoice | `prebuilt-invoice` | 1× |
| Receipt | `prebuilt-receipt` | 1× |
| General / PO / bank statement | layout + LLM | 2× |

Free plan: invoice & receipt only. COGS tracked per job in `estimated_cogs_aud`.

## Plans

| Plan | Credits/month | Price (AUD) |
|------|---------------|-------------|
| Free | 20 | $0 |
| Pro | 500 | $29/mo |
| Business | 3000 | $99/mo |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run Vitest unit tests |
| `npm run db:migrate` | Apply SQL migrations |

## Architecture

```
Upload → R2 storage → Azure prebuilt-invoice → Supabase (documents + ocr_jobs)
                    ↓
              Usage metering → Polar plan gating
```

Organization-scoped RLS ensures tenant isolation. OCR jobs store raw Azure response and mapped `extracted_data` JSON for the results viewer.

## License

Private — portfolio project.
