# Competitor Intelligence Engine

Autonomous competitor monitoring: scrapes competitor URLs on a schedule, detects meaningful changes semantically, scores business impact with an LLM, pushes intelligence cards to Airtable, and emails digests — plus a Chrome extension for one-click monitoring.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `GROQ_API_KEY` (LLM scoring), `AIRTABLE_API_KEY` (CRM sync), `RESEND_API_KEY` (digest email), `EXTENSION_API_KEY` (extra extension key), `SEMANTIC_THRESHOLD` (default 0.80), `AIRTABLE_TABLE_NAME` (default "Intelligence Cards"), `DIGEST_FROM_EMAIL`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5; frontend: React + Vite (`artifacts/competitor-intel`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Groq (llama-3.1-8b-instant) for classification; Resend for email; node-cron scheduler; cheerio scraper

## Where things live

- DB schema: `lib/db/src/schema/` (competitors, scrapeHistory, changes, crmQueue, businessProfile, appSettings)
- API contract: `lib/api-spec/openapi.yaml` → generated hooks in `lib/api-client-react`, Zod in `lib/api-zod`
- Pipeline services: `artifacts/api-server/src/lib/` — scraper, semantic (TF-IDF cosine), classifier (Groq), pipeline, crmSync (Airtable + retry queue), emailDigest, scheduler
- Extension API (x-api-key auth): `artifacts/api-server/src/routes/extension.ts`
- Frontend pages: `artifacts/competitor-intel/src/pages/` (dashboard, feed, competitor-detail, settings, onboarding)
- Chrome extension (MV3, static, load unpacked): `artifacts/chrome-extension/`

## Architecture decisions

- Semantic change detection is TF-IDF cosine similarity over sentence chunks (threshold 0.80) — no heavy ML deps; first scrape only stores a baseline.
- Airtable sync is idempotent: record-id verify → search by `{Change ID}` → create; failures go to `crm_queue` with backoff, retried by the scheduler.
- Digest email is never sent when there are zero changes; grouped by competitor, sorted by impact, top 3 highlighted.
- Scheduler ticks every 15 min (scrapes due targets + retries CRM queue) and every 30 min (digest due-check). Errored targets retry on a 1h cooldown; only "paused" is skipped.
- Extension API key is auto-generated in app_settings and shown in Settings; the extension sends it as `x-api-key`.

## Product

- Dashboard (stats, targets, critical activity), Intelligence Feed (filters, read tracking), competitor detail (history, force scrape, pause), Settings (targets, digest, Airtable base ID, business profile, CRM retry queue, extension key)
- Onboarding wizard collects the business profile; impact scores are relative to it.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The whole web API is unauthenticated (single-user app); `/api/settings` exposes the extension key by design — add real auth before multi-user use.
- `lib/db/dist` declaration files can go stale and break typechecks with "no exported member" errors — run `npx tsc -b lib/db --force` after schema changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
