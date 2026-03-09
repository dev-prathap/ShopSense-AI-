# Week 2 Validation Checklist

## Goal
Validate end-to-end core sales agent behavior: ask -> recommend -> cart recovery/order support -> analytics attribution.

## Preconditions
- Store installed and catalog synced
- Admin has configured AI settings (`/api/admin/settings/ai`)
- Widget token issued from `/api/admin/widget/token`
- Billing subscription active

## Scenario 1: Product Discovery + Recommendation
1. Send chat message: `I need black running shoes under $100`.
2. Verify response includes intent `product_discovery` and max recommendations follow store setting.
3. Verify recommendations contain reason and in-stock products only.

Expected:
- `conversationId` returned
- `products.length <= aiMaxRecommendations`
- `recommendation_events` created

## Scenario 2: Recovery Offer + Conversion Linkage
1. Trigger `/api/cart-recovery/offer` for conversation.
2. Call analytics event `recovery_accept` with `offerCode`.
3. Call analytics event `conversion` with same `offerCode` and revenue.

Expected:
- `recovery_offers.acceptedAt` set
- `recovery_offers.convertedAt` set
- conversation `convertedAt` set

## Scenario 3: Order Tracking Cache Miss Fallback
1. Query `/api/order-status` with valid `storeId`, `orderNumber`, and `email` not present in `orders_cache`.
2. Verify API performs Shopify fallback lookup and upserts cache.
3. Repeat call to confirm cached response path works.

Expected:
- First call returns order data and stores cache row
- Second call returns from cache

## Scenario 4: Handoff Sensitivity
1. Set `aiHandoffSensitivity` high (e.g., 90).
2. Send ambiguous user message.
3. Check if handoff triggers faster (lower effective confidence threshold).

Expected:
- Higher sensitivity increases handoff probability
- `conversations.handoffReason` set when triggered

## Scenario 5: Security Controls
1. Call storefront endpoints without widget token.
2. Call admin endpoints without Shopify session token.
3. Replay idempotent events with same key.

Expected:
- Missing/invalid tokens are rejected
- Duplicate event rejected with conflict error

## Exit Criteria
- All 5 scenarios pass
- No cross-tenant data leakage observed
- Analytics snapshot reflects new conversion and recovery events
