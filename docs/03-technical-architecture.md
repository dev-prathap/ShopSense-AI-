# AI Sales Agent for Shopify
## Technical Architecture (V1)

## 1. Stack and Deployment Baseline
- Frontend/backend: Next.js App Router + API routes
- Data: Neon Postgres + Prisma ORM + pgvector extension
- AI provider: OpenAI (single provider)
- Hosting: Vercel
- Commerce platform: Shopify Admin APIs + OAuth + webhooks

## 2. System Components
### A. Merchant app surface
- Dashboard UI for onboarding status, metrics, and settings
- Invokes server APIs for analytics, sync triggers, and store-level configuration

### B. Storefront widget surface
- Embedded script loads iframe-based chat widget
- Sends shopper messages to chat API and renders recommendations

### C. API orchestration layer
- Handles intent classification, retrieval, generation, and logging
- Manages Shopify install/callback and webhook ingestion
- Processes analytics and recovery-offer lifecycle

### D. Data layer
- Tenant-scoped store metadata
- Product and order cache
- Conversations, messages, recommendation events
- Recovery and billing state

## 3. Request and Data Flows
### Chat flow
1. Widget sends message payload to `/api/chat`.
2. API resolves conversation lifecycle (`new` or `existing`).
3. Intent classification + confidence scoring.
4. Product retrieval (v1 fallback retrieval, vector-ready schema).
5. Response generation via OpenAI.
6. Persist assistant message, recommendation events, and handoff status.
7. Return structured response to widget.

### Catalog sync flow
1. Merchant trigger or webhook invokes `/api/sync/catalog`.
2. Server reads products from Shopify Admin GraphQL.
3. Product records are upserted with inventory state.
4. Embedding pipeline can be attached to `product_embeddings` table lifecycle.

### Order status flow
1. Shopper or system requests `/api/order-status` with scoped identifiers.
2. Server fetches `orders_cache` row constrained by `storeId`.
3. Safe status payload returned; missing orders return 404.

### Recovery and analytics flow
1. Recovery endpoint generates discount offer and tracks issuance.
2. Analytics endpoint captures click/conversion/recovery acceptance.
3. Dashboard snapshot aggregates revenue and intent insights.

## 4. Service Boundaries
- `Shopify boundary`: OAuth, token exchange, catalog/order webhook sync
- `AI boundary`: intent + generation with fallback behavior when provider unavailable
- `Analytics boundary`: event ingestion and snapshot reporting
- `Billing boundary`: trial provisioning and tier state

## 5. Multi-Tenancy Model
- `storeId` is mandatory tenant key across all domain tables.
- API handlers enforce store-scoped query/update patterns.
- No cross-store joins without explicit store filter.

## 6. Security Model
- Access tokens never exposed to client code.
- Environment secrets loaded server-side only.
- Shopify webhook HMAC verification required before processing.
- OAuth callback signature validation required.
- Conversation/order endpoints must prevent cross-tenant leakage.

## 7. Reliability, Retry, and Timeout Strategy
- Shopify/LLM requests should use explicit timeout guards.
- Retries with exponential backoff for transient failures.
- Idempotent upsert patterns for webhooks and sync.
- Operationally safe no-op behavior for unknown stores/webhooks.

## 8. Observability and Operations
- Structured logs for install, sync, chat, conversion, and webhook events.
- Error rate, latency, and provider-failure counters.
- Daily monitoring on:
  - API error spikes
  - webhook backlog/retry failures
  - chat latency regression
  - missing attribution anomalies

## 9. Deployment Topology (Vercel + Neon)
- Vercel hosts Next.js app and API routes.
- Neon hosts Postgres with pgvector enabled.
- Environment variables configured in Vercel project settings.
- Production rollout with staging validation and pilot merchant canary.
