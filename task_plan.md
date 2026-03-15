# Neryn AI Implementation Plan

## Phase 1: Merchant Inbox & Human Handoff (COMPLETE)

- [x] List conversations in the dashboard.
- [x] Add deep-link to individual conversation view.
- [x] Create detailed conversation view with full message history.
- [x] Implement merchant "Reply" functionality (updates the chat for the visitor).
- [x] Add "Resolve" button for conversations.

## Phase 2: Enhanced Widget Aesthetics (COMPLETE)

- [x] Refine `WidgetEmbedClient.tsx` with premium SpaceX-inspired animations.
- [x] Add modern typography and glassmorphism.
- [ ] Add support for "Store Info" view in the widget.

## Phase 3: Knowledge Base Improvements (COMPLETE)

- [x] Add manual text/FAQ entry form in `KnowledgeSetup`.
- [x] Created API for direct text ingestion.
- [x] Implement "Re-train" button for individual sources.

## Phase 4: Shopify Sync & Auto-Updates (PROGRESSING)

- [x] Setup Webhook handlers for `products/update`.
- [x] Created Knowledge Sync Cron job.
- [ ] Add "Sync Now" button in Dashboard.

## Phase 5: Notifications & Billing

- [ ] Implement email notifications for "Human Handoff".
- [ ] Add monthly message usage tracking.
- [ ] Implement hard-limits for Starter tier.
