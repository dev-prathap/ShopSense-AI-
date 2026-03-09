# AI Sales Agent for Shopify
## PRD - MVP

## 1. Product Goal
Ship a production-usable Shopify AI sales assistant in 3 weeks that can onboard pilot merchants and prove early paid conversion value.

## 2. Personas
### Persona A: Founder-Operator
- Runs a growing Shopify store
- Needs fast revenue impact with minimal setup
- Cares about conversion and ROI dashboard clarity

### Persona B: Ecommerce Manager
- Owns merchandising and conversion optimization
- Needs reliable recommendation and product discovery behavior
- Needs fast feedback loop on customer intent patterns

### Persona C: Shopper (Storefront visitor)
- Wants quick product fit answers and clear recommendations
- Needs confidence on shipping, return, and order status
- Expects immediate, frictionless conversation in-store

## 3. Jobs to Be Done
- Help shoppers discover the right products quickly
- Resolve buying objections before checkout drop-off
- Recover uncertain buyers with contextual offers
- Give merchants visibility into revenue impact of AI interactions

## 4. User Journeys
### Merchant onboarding journey
1. Merchant installs app via Shopify OAuth.
2. Catalog sync is triggered and products become available to AI.
3. Merchant enables widget and configures recovery discount.
4. Merchant monitors conversations and attributed revenue in dashboard.

### Shopper buying journey
1. Shopper opens widget and describes need in natural language.
2. AI classifies intent and returns up to 3 recommendations.
3. AI answers product/policy/order queries using store context.
4. If shopper hesitates, recovery offer can be shown.
5. Shopper converts; analytics event logs attributed revenue.

## 5. Functional Requirements
### FR-1 Shopify install and auth
- System must support OAuth install and callback.
- System must persist store identity and access token securely server-side.

### FR-2 Catalog ingestion
- System must ingest product metadata from Shopify.
- System must upsert product records and inventory state.
- System must re-sync on relevant webhook updates.

### FR-3 Conversational AI
- System must accept `storeId`, `visitorId`, `message` and optional `conversationId`.
- System must classify intent and generate sales-focused response.
- System should return max 3 products with reasons, price, and stock signal.

### FR-4 Handoff policy
- System must trigger handoff on low confidence, billing/refund intent, or repeated failures.
- System must store handoff reason for reporting.

### FR-5 Order tracking
- System must support safe order-status lookups scoped by store and order identifiers.
- System must not leak order info across stores or unrelated customers.

### FR-6 Cart recovery
- System must support creation and tracking of recovery offers.
- System must expose offer code and discount prompt for in-conversation use.

### FR-7 Analytics
- System must ingest events for session start, product click, conversion, and recovery acceptance.
- System must compute snapshot metrics: conversations, converted conversations, attributed revenue, top intents, recovery acceptance rate.

### FR-8 Billing and trial
- System must provision a 14-day trial record on successful install.
- System must store active tier for future enforcement.

## 6. Non-Functional Requirements
- p95 chat response target: <= 3 seconds under pilot load
- Multi-tenant isolation at data access layer
- Webhook authenticity verification and replay-aware handling
- Reliable retries/backoff for third-party API failures
- Auditability for revenue attribution events

## 7. Success Criteria (MVP)
- 5-10 pilot stores onboarded
- >0 AI-attributed paid conversions observed
- Stable install/sync/chat loop without critical incidents
- Merchants can self-verify value via dashboard

## 8. Out of Scope (MVP)
- Non-Shopify platforms
- Voice and messaging channel expansion
- Full enterprise SLA/compliance package
- Multi-model routing and BYO model keys

## 9. Requirement Traceability
- Recommendation and Q&A requirements map to chat API and product data contracts.
- Order tracking requirement maps to order-status API and orders cache contracts.
- Recovery and revenue requirements map to recovery-offer and analytics event contracts.
- Trial monetization requirement maps to billing subscription lifecycle contract.
