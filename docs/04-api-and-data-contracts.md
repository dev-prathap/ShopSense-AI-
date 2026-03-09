# AI Sales Agent for Shopify
## API and Data Contracts (V1)

## 1. API Contract Standards
- Content type: `application/json`
- Tenant scoping: `storeId` required for all business endpoints
- Error shape: `{ "error": <string|object> }`
- Idempotency: upsert endpoints/webhook processing must be safe on retries
- Attribution window default: 7 days (store-configurable)

## 2. API Contracts

### POST `/api/chat`
Purpose: Conversational AI response with recommendations and handoff logic.

Request:
```json
{
  "storeId": "string",
  "visitorId": "string",
  "conversationId": "string (optional)",
  "message": "string"
}
```

Response:
```json
{
  "conversationId": "string",
  "reply": "string",
  "intent": "product_discovery|product_question|shipping_policy|order_tracking|returns_policy|billing_or_refund|small_talk|unknown",
  "confidence": 0.86,
  "products": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "price": 99,
      "currency": "USD",
      "inStock": true,
      "reason": "High match for your request"
    }
  ],
  "handoff": {
    "required": false,
    "reason": "string (optional)"
  }
}
```

Conversation lifecycle:
- Missing `conversationId` creates a new conversation.
- Existing `conversationId` appends messages to same conversation.
- Handoff states are persisted to conversation status.

### POST `/api/sync/catalog`
Purpose: Trigger Shopify product sync.

Request:
```json
{ "storeId": "string" }
```

Response:
```json
{ "synced": 42 }
```

### GET `/api/order-status`
Purpose: Return shopper-safe order state.

Query params:
- `storeId` (required)
- `orderNumber` (required)
- `email` (optional, recommended for stronger verification)

Response:
```json
{
  "orderNumber": "13452",
  "fulfillmentStatus": "fulfilled",
  "financialStatus": "paid",
  "trackingNumber": "TRK123",
  "trackingUrl": "https://...",
  "estimatedDeliveryAt": "2026-03-12T10:00:00.000Z"
}
```

### POST `/api/analytics/events`
Purpose: Capture behavioral and revenue attribution events.

Request:
```json
{
  "storeId": "string",
  "conversationId": "string (optional based on event)",
  "eventType": "session_start|product_click|conversion|recovery_accept",
  "productId": "string (optional)",
  "revenue": 120.5
}
```

Response:
```json
{
  "ok": true,
  "snapshot": {
    "conversations": 100,
    "attributedRevenue": 1420,
    "convertedConversations": 12,
    "recoveryAcceptanceRate": 0.22,
    "topIntents": [{ "intent": "product_discovery", "count": 40 }]
  }
}
```

### POST `/api/cart-recovery/offer`
Purpose: Generate and track a recovery offer.

Request:
```json
{
  "storeId": "string",
  "conversationId": "string"
}
```

Response:
```json
{
  "offerCode": "SAVE10-ABC123",
  "discountPct": 10,
  "prompt": "Wait, before you go: use SAVE10-ABC123 for 10% off."
}
```

### GET `/api/shopify/install`
Purpose: Start OAuth flow.

Query:
- `shop` required (`{shop}.myshopify.com`)

Behavior:
- Generates state cookie and redirects to Shopify authorization URL.

### GET `/api/shopify/callback`
Purpose: Complete OAuth flow and create/update store.

Required callback params:
- `shop`, `code`, `hmac`, `state`

Behavior:
- Validates state and callback HMAC.
- Exchanges code for access token.
- Upserts store and provisions trial.
- Redirects to dashboard.

### POST `/api/webhooks/shopify`
Purpose: Process Shopify events.

Headers used:
- `x-shopify-topic`
- `x-shopify-shop-domain`
- `x-shopify-hmac-sha256`

Supported topics:
- `products/create`, `products/update`
- `inventory_levels/update`
- `orders/create`, `orders/updated`
- `app/uninstalled`

## 3. Error Codes and Expectations
- 400: malformed request or missing fields
- 401: invalid signature/HMAC
- 404: resource not found in tenant scope
- 500: unexpected server/provider failure

Operational expectations:
- Webhook handlers must return success quickly when store record is absent.
- Retriable failures should avoid partial duplicate side effects.

## 4. Data Contracts

### `stores`
- Tenant root entity.
- Keys: `id`, `shopDomain` (unique), `accessToken` (server-only), `attributionWindowDays`, `cartRecoveryDiscountPct`.

### `products`
- Catalog state per store.
- Keys: `storeId`, `shopifyId` unique composite, title/description/category/price/inventory/tags.

### `product_embeddings`
- Retrieval-ready vector rows tied to products.
- Keys: `storeId`, `productId`, `content`, vector embedding.

### `orders_cache`
- Normalized order status cache.
- Keys: `storeId`, `shopifyOrderId` unique composite, financial/fulfillment/tracking state.

### `conversations`
- Shopper conversation session.
- Keys: `storeId`, `visitorId`, status (`OPEN|HANDOFF_REQUESTED|RESOLVED`), `convertedAt`.

### `recommendation_events`
- Product recommendations emitted by AI with position/rationale and click/convert timestamps.

### `recovery_offers`
- Generated offer lifecycle including `offeredAt`, `acceptedAt`, `convertedAt`.

### `billing_subscriptions`
- Trial/tier state per store.
- Includes `trialEndsAt`, active flag, and plan tier.

## 5. Widget Embed Interface
Embed contract:
```html
<script>
  window.__AI_SALES_AGENT_URL__ = "https://your-app-domain.com";
</script>
<script src="https://your-app-domain.com/widget.js"></script>
```

Minimum behavior:
- Loads fixed-position iframe widget.
- Widget communicates with app-hosted APIs.
- Merchant storefront should not receive secrets/tokens.
