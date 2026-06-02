# AI Sales Agent for Shopify (MVP)

Next.js + Postgres (pgvector) MVP that provides a Shopify AI sales assistant with product Q&A, recommendations, order tracking, cart recovery, and analytics.

## Stack

- Next.js (App Router + API routes)
- Shadcn UI component layer (Tailwind + CVA primitives)
- Prisma + PostgreSQL + pgvector
- OpenAI single-provider LLM integration
- Shopify OAuth + Admin API + webhooks

## Implemented APIs

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`
- `GET /api/app/stores`
- `GET /api/app/onboarding/status`
- `POST /api/app/onboarding/complete-step`
- `POST /api/chat`
- `GET /api/order-status`
- `POST /api/analytics/events`
- `POST /api/cart-recovery/offer`
- `POST /api/admin/sync/catalog`
- `POST /api/admin/widget/token`
- `GET /api/admin/settings/ai`
- `PUT /api/admin/settings/ai`
- `GET /api/admin/inbox/conversations`
- `GET /api/admin/inbox/conversations/[conversationId]`
- `POST /api/admin/inbox/conversations/[conversationId]/resolve`
- `POST /api/admin/webhooks/register`
- `POST /api/admin/jobs/process`
- `GET /api/cron/retry-jobs`
- `POST /api/webhooks/shopify`
- `GET /api/shopify/install`
- `GET /api/shopify/callback`

## Admin UI Routes

- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/connect`
- `/dashboard/onboarding`
- `/dashboard/inbox`
- `/dashboard/settings`
- `/dashboard/billing`

## Data model

Prisma schema includes:

- `stores`, `users`, `products`, `product_embeddings`, `orders_cache`
- `conversations`, `messages`, `recommendation_events`, `recovery_offers`
- `billing_subscriptions`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Prepare database and generate Prisma client:

```bash
npx prisma migrate dev --name init
```

4. Start app:

```bash
npm run dev
```

## Shopify install

Use:

- `GET /api/shopify/install?shop={your-shop}.myshopify.com`

## Widget embed snippet

```html
<script>
  window.__AI_SALES_AGENT_URL__ = "https://your-app-domain.com";
</script>
<script src="https://your-app-domain.com/widget.js"></script>
```

## Notes

- `src/lib/ai/retrieval.ts` currently uses metadata filtering + recency ranking as MVP fallback. Replace with vector similarity SQL once embeddings pipeline is connected.
- Webhook registration + production billing charge creation should be completed during deployment hardening.
- Protected storefront endpoints (`/api/chat`, `/api/order-status`, `/api/analytics/events`, `/api/cart-recovery/offer`) require a signed widget token in `Authorization: Bearer <token>` or `x-store-token`.
- Generate widget tokens via `POST /api/admin/widget/token` with Shopify App Bridge session token (`Authorization: Bearer <shopify_session_jwt>`).
- Billing uses Shopify Managed Pricing: plans are declared in the Shopify Partners Dashboard and the `/dashboard/billing` page redirects merchants to Shopify's hosted plan picker. Plan state is synced locally via the `app_subscriptions/update` webhook.
- Shopify callback now attempts webhook auto-registration and initial catalog sync.
- `POST /api/admin/webhooks/register` can be used to manually reconcile webhook subscriptions for an installed store.
- Retry jobs are persisted in database (`RetryJob`) and processed via `POST /api/admin/jobs/process` with exponential backoff.
- Automatic retry processing is scheduled via Vercel Cron (`vercel.json`) hitting `GET /api/cron/retry-jobs` every 10 minutes.
- Cron endpoint requires `Authorization: Bearer <CRON_SECRET>` (or `x-cron-secret`) and `CRON_SECRET` must be set in environment.
- Admin RBAC is enabled via `users.role` (`OWNER`, `STAFF`); owner-only actions include billing and webhook registration.
- Admin APIs use Shopify session token verification (HS256 signature with `SHOPIFY_API_SECRET`, audience `SHOPIFY_API_KEY`, and `dest` store-domain match).
- Admin RBAC identity is resolved from Shopify session claims (`sub` and/or `email`) mapped to `users` table.
- `GET /api/order-status` now requires `email` query param and validates exact store+order+email match.
- Rate limiting and idempotency use Upstash Redis when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured, with in-memory fallback for development.
- AI settings are store-configurable via `/api/admin/settings/ai` (`aiTone`, `aiMaxRecommendations`, `aiHandoffSensitivity`, recovery toggles, `supportEmail`, `handoffWebhookUrl`).
- Human handoff notifications are sent to `handoffWebhookUrl`; failures are retried via retry queue job type `HANDOFF_NOTIFY`.
- Conversation ops inbox APIs are available under `/api/admin/inbox/conversations*` for triage and resolve flows.
- Week 3 admin pages are built with shadcn-style UI components under `src/components/ui`.
- App-level authentication is JWT cookie based (`asa_app_session`) with email/password and Google OAuth.
- Dashboard routes are protected by middleware and redirect unauthenticated users to `/login`.
- Shopify connect now maps authenticated app users to stores via `AppUserStoreMembership`.
- Post-login flow: no mapped store -> `/dashboard/connect`, onboarding incomplete -> `/dashboard/onboarding`, else main dashboard.
- Catalog sync now supports Shopify product pagination and variant-level caching (`ProductVariant`) with collection metadata capture.
- Inventory webhook (`inventory_levels/update`) applies live delta updates using cached `inventoryItemId`; falls back to full catalog sync if mapping is missing.
- Customer data is enriched into `CustomerCache` from `customers/*` and `orders/*` webhooks.
