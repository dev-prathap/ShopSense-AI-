# Findings - "BOT" AI Sales Agent for Shopify

## Project Identity

- **Name**: BOT
- **Description**: AI Sales Agent for Shopify (MVP).
- **Core Functionality**: Product Q&A, recommendations, order tracking, cart recovery, and analytics.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL with `pgvector`
- **ORM**: Prisma
- **AI**: OpenAI (likely, based on README)
- **Integrations**: Shopify Admin API, Webhooks, App Bridge
- **Styling**: Tailwind CSS
- **Other**: Upstash Redis (rate limiting), Vercel Cron (background jobs)

## Deep Dive: AI Architecture

- **Orchestration**: `src/lib/ai/service.ts` coordinates intent classification, retrieval, and response generation.
- **Intent & Handoff**: `intent.ts` uses merchant-defined sensitivity levels to decide when to pass to a human.
- **Vector Search**: Uses `pgvector` with cosine distance (`<=>`).
- **Retrieval Engine**:
  - **Primary**: Vector similarity search using OpenAI embeddings.
  - **Fallback**: Keyword-based scoring for resilience.
  - **Context Aware**: Extracts budget constraints (e.g., "under $100") from natural language.

## Deep Dive: Shopify Integration

- **Sync Catalog**: Automated fetching of products via Shopify GraphQL, followed by building a vector index.
- **Webhooks**: Robust processing with a retry queue (`RetryJob`) and exponential backoff.
- **Billing**: Supports subscription tiers (Starter, Growth, Pro, Enterprise) via Shopify Recurring Application Charges.
- **Admin Dashboard**: Next.js App Router used for store-side configuration and inbox management.

## Project Status

- **Implemented**: RAG (Retrieval-Augmented Generation), Shopify Sync, Intent-based Handoff, Basic Analytics, Abandoned Cart Recovery.
- **In Progress**: UI Enhancement (recent installation of Tailwind/Lucide), Webhook hardening, Production Billing.
- **Potential improvements**: Multi-language support, deeper order fulfillment tracking, automated A/B testing for recovery offers.

## Directory Structure Analysis

- `/src/app/api`: All backend logic, including admin management and storefront APIs.
- `/src/lib/ai`: Handling LLM interactions and embedding retrieval.
- `/src/lib/shopify`: Oauth and Admin API wrappers.
- `/src/lib/recovery`: Logic for abandoned cart offers.
- `/src/lib/handoff`: Mechanism for connecting customers to human staff.
- `/src/lib/jobs`: Background job processing with retries.

## Database Schema Key Points

- `Store`: Central configuration for each Shopify merchant.
- `Product` & `ProductEmbedding`: Foundation for AI-powered product search.
- `Conversation` & `Message`: Chat history with support for statuses (`OPEN`, `HANDOFF_REQUESTED`, `RESOLVED`).
- `RecommendationEvent`: Tracks AI-suggested product performance.
- `RecoveryOffer`: Tracks effectiveness of abandoned cart discounts.
- `RetryJob`: Robust handling for task failures (e.g., webhook notifications).

## Known Issues/Gaps (from README)

- `src/lib/ai/retrieval.ts` uses fallback logic instead of full vector search.
- Webhook registration and production billing need "hardening".
- Rate limiting and idempotency are optional (requires Upstash).
