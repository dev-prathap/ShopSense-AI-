# AI Sales Agent for Shopify
## 3-Week Delivery Plan

## 1. Delivery Objective
Ship a paid-install-ready MVP in 3 weeks, onboard 5-10 pilot stores, and validate AI-attributed revenue signal.

## 2. Team Roles and Ownership
- Founder/PM: scope control, pilot recruitment, messaging, pricing decisions
- Full-stack engineer: core app, APIs, data, integrations
- QA/support owner (can be founder during MVP): pilot onboarding validation, issue triage, feedback loop

## 3. Week-by-Week Plan

### Week 1 - Foundation and Installability
Deliverables:
- Shopify OAuth install/callback and secure token persistence
- Base schema and Neon connectivity with Prisma migrations
- Catalog sync from Shopify + webhook ingestion for products/inventory/orders
- Widget embed script and basic chat UI shell
- Environment setup for Vercel + Neon + OpenAI

Exit gate:
- Merchant can install app and complete initial catalog sync successfully.

### Week 2 - Sales Agent Core
Deliverables:
- Chat API orchestration (intent, retrieval, response generation)
- Recommendation response format with max-3 product policy
- Handoff logic for low-confidence and billing/refund intents
- Order-status endpoint with tenant-safe filtering
- Cart recovery offer generation and tracking path

Exit gate:
- End-to-end shopper flow works in staging: ask -> recommend -> recovery/order status.

### Week 3 - Monetization, Analytics, and Launch Readiness
Deliverables:
- Analytics event ingestion and merchant KPI snapshot dashboard
- Trial provisioning and tier baseline
- Reliability pass: retries, timeout handling, error logging
- Pilot onboarding kit and launch checklist
- Production deployment and pilot canary stores

Exit gate:
- At least 5 pilot stores live with stable chat behavior and attributable conversion events.

## 4. Dependencies and Critical Path
Critical path:
1. OAuth + token + schema stability
2. Catalog availability and product freshness
3. Chat quality and recommendation relevance
4. Analytics attribution integrity
5. Billing/trial activation before paid launch

External dependencies:
- Shopify app credentials and scopes
- OpenAI API quota and key
- Neon database readiness and pgvector extension
- Vercel project env and domain setup

## 5. Risk Register and Mitigations
- Risk: LLM latency spikes
  - Mitigation: timeout fallback response + reduced token payload
- Risk: stale product data
  - Mitigation: webhook-triggered sync and manual resync endpoint
- Risk: incorrect order disclosures
  - Mitigation: strict store/order scoping + optional email verification
- Risk: attribution trust gap with merchants
  - Mitigation: transparent event logs and clearly defined attribution window
- Risk: trial users not converting
  - Mitigation: in-app proof of ROI, onboarding prompts, founder-led check-ins

## 6. Pilot Onboarding Playbook (5-10 Stores)
1. Qualify store fit (SKU range, support pain, conversion focus).
2. Install app with founder-assisted setup call.
3. Validate sync, widget placement, and top FAQ coverage.
4. Run 7-day pilot with daily metrics check.
5. Capture testimonial or issue list.
6. Convert pilot to paid plan before trial end.

## 7. Launch Checklist
- Install/uninstall/reinstall works
- Catalog sync and webhook updates verified
- Chat responses relevant and policy-safe
- Order-status endpoint tenant-safe
- Recovery offer generation and acceptance tracked
- Analytics dashboard reflects live events
- Trial/billing states created correctly
- Alerts/logs available for core failure paths

## 8. Post-Launch Monitoring (First 30 Days)
Daily:
- API errors, chat latency, webhook processing status
- Conversation volume and recommendation clicks
- Conversion/recovery acceptance trends

Weekly:
- Store retention, trial-to-paid conversion
- Top unanswered intents and quality fixes
- Feature gap list for next sprint
