NERYN.PRO
Website Audit Report
Complete Review — Content · Design · Structure · Conversion

9
Critical Issues
7
High Priority
5
Medium / Polish
 
 
Prepared by: Claude (Anthropic)  |  Date: March 2026  |  Site: neryn.pro

1. Executive Summary

Neryn is positioned as an LLM-powered product recommendation and cart assistant for Shopify, WooCommerce, and BigCommerce stores. The core product idea is strong and the pricing page content is well-built. However, the rest of the site has a fundamental identity crisis: it reads as an enterprise internal-operations AI platform (data warehouses, EMEA region analytics, Fortune 500, SSO, SOC2, VP of Operations personas), not as a conversion tool for e-commerce store owners.
 
The single most damaging issue is messaging-audience mismatch. A Shopify merchant landing on this page will not recognise themselves or their problem anywhere until they reach the pricing section. This will kill conversion regardless of design quality.
 
Secondary issues include a placeholder email in live CTAs, a typo in the hero, fake/placeholder brand logos, irrelevant chat mockup content, and a FAQ section tuned entirely to enterprise procurement concerns rather than Shopify store owner anxieties.
 
The report is structured as follows: Section 2 is a full issue register. Sections 3–8 cover each page area with line-by-line content and design recommendations. Section 9 is a prioritised action plan.

2. Full Issue Register

All issues catalogued below are referenced throughout the report.
 
ID
Severity
Area
Issue
C-01
Critical
Messaging
Entire site reads as enterprise internal-ops AI, not an ecom chatbot
C-02
Critical
Hero Copy
Typo: 'provided 24/7' should be 'providing 24/7'
C-03
Critical
Hero Widget
Chat mockup shows enterprise analytics, not product recommendations
C-04
Critical
Social Proof
'Trusted by Fortune 500 companies' — wrong audience signal entirely
C-05
Critical
Social Proof
All logos are placeholders (Company, Zestia, Square, Acme) — zero credibility
C-06
Critical
Section 3
'Automate operations across your enterprise' — wrong section entirely
C-07
Critical
Section 4
Security section (SOC2, VPC, SSO, RBAC) targets procurement, not Shopify merchants
C-08
Critical
Testimonial
Testimonial from VP of Operations at GlobalTech — completely wrong persona
C-09
Critical
CTA / Footer
Contact email is 'hello@yourdomain.com' — placeholder live in production
H-01
High
Hero Subhead
Scope says Shopify only; body text says Shopify/WooCommerce/BigCommerce — inconsistent
H-02
High
Section 5
Analytics section (query latency, API calls, model accuracy) is meaningless to store owners
H-03
High
Section 6
'Integrate with your data stack' shows data warehouses and vector databases — not ecom tools
H-04
High
Section 7
'Turn complex data into clear strategic action' — B2B enterprise copy, not ecom positioning
H-05
High
FAQ
All 4 FAQ questions are enterprise procurement concerns (CRM/ERP, cloud deployment, compliance)
H-06
High
Navigation
Nav links (Solutions, Platform, Security, Resources) are dead — all anchor to #
H-07
High
Stock Photos
Hero image is a generic woman-with-phone Unsplash photo — no product context
M-01
Medium
Hero CTA
Single CTA 'Launch AI Agent' is too vague — doesn't say what happens next
M-02
Medium
Pricing
Pricing tab says 'Enterprise Choice' — wrong label for a $100/mo product
M-03
Medium
Footer
'Cover page' link in Company column is a dead placeholder
M-04
Medium
Footer
Twitter/Career/Policy/Blog/Community all link to # — broken trust signals
M-05
Medium
CTA Section
'Join 450+ Shopify brands' — if unverified, remove it; if real, surface it higher on page

3. Navigation

Current State

Nav items: Neryn (logo) · Solutions · Platform · Security · Pricing · Resources · Start Free Trial (CTA button)
Issues: Solutions, Platform, Security, and Resources all link to # (dead links). The nav structure mirrors an enterprise SaaS product (think Salesforce or Workday) rather than a focused ecom plugin. The 'Security' tab in particular signals to Shopify merchants that this is a complex enterprise tool they may not need.
 
Recommended Nav

High
Location: Navigation Bar   Type: Structure + Content
Current
Solutions | Platform | Security | Resources (all dead links, enterprise-oriented labels)
Recommended
How It Works | Pricing | Integrations | Blog | Start Free Trial All items should link to real anchor sections on the homepage or live subpages. Remove 'Security' from the primary nav — it can live in the footer or a Trust section lower on the page.
 

4. Hero Section

4.1 — Headline

High
Location: Hero — H1 Headline   Type: Content
Current
Automate your Shopify Sales with Neryn AI
Recommended
Turn every browser into a buyer. Neryn reads what your shoppers mean — and gets them to checkout. (Rationale: The current headline is functional but generic. The recommended version focuses on the outcome the store owner cares about — conversion — rather than the feature — automation.)
 
4.2 — Subheadline

Critical
Location: Hero — Subheadline   Type: Content + Grammar Fix
Current
Instantly engage customers, boost conversions, and provided 24/7 intelligent support—no code required. ['provided' is a grammar error]
Recommended
An LLM-powered sales assistant that understands intent, recommends the right products, and adds them to cart — embedded on Shopify, WooCommerce, and BigCommerce. No code required. (Fixes the typo, clarifies the three platforms, and makes the product mechanism explicit.)
 
4.3 — CTA Button

Medium
Location: Hero — Primary CTA   Type: Content
Current
Launch AI Agent
Recommended
Start Free Trial  (secondary: See a Demo) (Rationale: 'Launch AI Agent' is ambiguous — it sounds like you're deploying something complex. 'Start Free Trial' is a standard, low-friction ecom SaaS CTA with clear intent. A secondary 'See a Demo' link should sit beside it for visitors who need convincing.)
 
4.4 — Hero Chat Mockup (Critical)

Critical
Location: Hero — Floating Chat Widget   Type: Content + Design
Current
The chat bubble shows: 'Based on Q3 data, enterprise subscriptions are up by 18% in the EMEA region.' + 'What's our current revenue growth trend for Q3?' + 'Perfect, generate a report.' — This is an internal analytics assistant, not a product recommendation bot.
Recommended
Replace with a realistic shopping conversation: Shopper: I'm off to Bali next week, what should I grab? Neryn: Sounds amazing! You'll want sun protection — here are our top 3 SPF picks: [Product card: UltraShield SPF 50 · $28 · ⭐ 4.8] Shopper: I'll take the SPF 50! Neryn: ✅ Added to your cart. Anything else? (This directly demonstrates the product's core value in the hero — the most valuable real estate on the page.)
 
4.5 — Hero Stock Image

High
Location: Hero — Background / Side Image   Type: Design
Current
Generic Unsplash photo of a woman using a phone (photo-1573496359142). No product context, no ecom connection.
Recommended
Replace with either: (a) a clean product mockup showing the Neryn widget embedded on a real-looking Shopify store, OR (b) a split-screen showing a shopper typing a question and seeing product cards appear. If budget is limited, use a device frame mockup (Figma/Canva) with a real chat interface screenshot.
 

5. Social Proof / Logo Bar

Critical
Location: Social Proof — Headline   Type: Content
Current
Trusted by Fortune 500 companies Powering intelligent operations and secure workflows for modern enterprises.
Recommended
Loved by independent Shopify stores and growing DTC brands. (Remove the Fortune 500 language entirely. Your audience is small-to-mid Shopify merchants, not enterprise procurement teams. This messaging actively signals the wrong product.)
 
Critical
Location: Social Proof — Logo Strip   Type: Design + Content
Current
Placeholder logos: Company, Zestia, Triangle, Parallel, Square, Acme, Global — none are real brands. The scrolling strip makes this very visible.
Recommended
Option A (recommended): Remove the logo strip entirely until you have 5+ real logos with permission to use them. Replace with a stat bar: '450+ stores · $2.4M in assisted sales · 4.9/5 avg. rating' (use real numbers only). Option B: Show 3–4 genuine customer logos if available, static — not a scrolling strip.
 

6. Feature Sections (Sections 3–7 on Page)

6.1 — 'Automate operations across your enterprise'

Critical
Location: Section 3 Headline + Body   Type: Content
Current
Automate operations across your enterprise Deploy intelligent AI agents that connect with your internal systems, databases, and APIs to handle complex tasks securely and efficiently. Features: Automated internal workflows · Data-driven insights · Secure knowledge retrieval
Recommended
Replace this entire section with the product's actual three-step flow: Headline: Three steps. Installed in minutes. 01 — Connect: Add the Neryn plugin to your Shopify, WooCommerce, or BigCommerce store. One click from the app store. 02 — Sync: Your live product catalog — prices, variants, reviews, stock — is injected automatically. 03 — Sell: Neryn reads visitor intent and recommends the right products. Shoppers add to cart in the chat.
 
6.2 — 'Secure, compliant, and scalable AI'

Critical
Location: Section 4 — Security Section   Type: Content
Current
Role-based access control, SSO integration, and comprehensive audit logs for all AI interactions. SOC2 Type II · GDPR Compliant · Private VPCs Live Data Integration: Connect seamlessly with your existing data warehouses and CRMs for real-time insights.
Recommended
Replace with a trust section more relevant to Shopify merchants: Headline: Safe for your store. Honest with your shoppers. — Only recommends products that exist in your catalog. No hallucinations. — Stays strictly on-topic. Won't discuss competitors or go off-brand. — GDPR-compliant data handling. No shopper data stored or sold. — Works with your existing Shopify/WooCommerce permissions. No new access required. (You can still mention SOC2 compliance in a small trust badge row at the bottom of this section, but it should not be the headline.)
 
6.3 — 'Enterprise Analytics'

High
Location: Section 5 — Analytics Section   Type: Content
Current
Query Latency: 120ms avg · API Usage: 8.4M calls · Model Accuracy: 99.4% Custom report generation · Real-time metrics · Exportable data formats
Recommended
Replace with ecom-relevant metrics the store owner actually cares about: Headline: Know what your shoppers are asking for. — See which products get recommended most — Track chat-to-cart conversion rate — Identify top queries that didn't match any product (catalog gaps) — Monthly summary delivered to your inbox (The current analytics section reads like infrastructure monitoring, not merchant intelligence.)
 
6.4 — 'Integrate with your data stack'

High
Location: Section 6 — Integrations Section   Type: Content + Design
Current
Data Warehouses · Internal APIs · Vector Databases · Identity Providers
Recommended
Headline: Plugs into the tools you already use. — Shopify (official app) — WooCommerce (plugin) — BigCommerce (app) — Gorgias / Zendesk (for SupportDesk AI) — Google Analytics (session tracking) — Klaviyo (coming soon) (Real integrations your audience will recognise. Remove Vector Databases and Identity Providers entirely — those signal enterprise infrastructure to the wrong audience.)
 
6.5 — 'Turn complex data into clear strategic action'

High
Location: Section 7 — Data/CTA Section   Type: Content
Current
Unify your company's knowledge. Give your team instant access to insights, metrics, and automated reports through a simple conversational interface. +380% Revenue growth metric.
Recommended
Replace with a social proof / results section: Headline: Results stores are seeing. — 'We saw a 23% lift in conversions in the first month.' — Founder, skincare DTC brand — '40% of our cart additions now come through Neryn.' — Shopify store owner — Stat: Avg. 18% increase in AOV when shoppers use the bot vs. browse unassisted. (Use real results if available. If not, use anonymised or estimated data with a disclaimer until real testimonials are collected.)
 

7. Testimonial Section

Critical
Location: Testimonial — Quote + Attribution   Type: Content
Current
"The Neryn AI implementation reduced our internal data retrieval time by 80%. Our analysts are finally focused on strategy rather than data hunting." — Elena Rodriguez, VP of Operations, GlobalTech
Recommended
Replace with an ecom-specific testimonial: "I sell skincare and my customers always had questions before buying. Neryn just handles it — they describe their skin type and it recommends the right serum. My cart abandonment dropped noticeably in the first two weeks." — [Store Owner Name], Founder of [Brand Name], Shopify store (If you don't have a real testimonial yet, remove this section and replace with a stat block until you collect one. A fake or wrong-persona testimonial damages trust more than having none.)
 

8. FAQ Section

Current FAQ Questions (all wrong audience)

Current (Remove)
Replace With
How does Neryn integrate with our existing systems?
Does it work with my existing Shopify theme? Yes. The widget is injected as a lightweight overlay — no theme edits or layout conflicts.
Is our proprietary data used to train public models?
What if my product catalog updates daily? Catalog data re-syncs every session. Pricing and stock status are always current.
What compliance standards do you meet?
Can it handle a large product catalog? Yes. Neryn injects relevant product subsets per query — it doesn't load your entire catalog every time.
Can we deploy the AI models in our own cloud environment?
Is there a free trial? 14 days, no credit card. Full feature access from day one.
— (add new)
Will it recommend products I don't carry? No. The bot only recommends products from your live catalog. It cannot hallucinate or suggest products outside your store.

9. Pricing Section

The pricing section is the strongest part of the site. The three-card layout, feature lists, and product differentiation are well-executed. A few targeted fixes:
 
Medium
Location: Pricing — Tab Label   Type: Content
Current
Tab label reads 'Enterprise Choice'
Recommended
Change tab label to 'Our Products' or 'What we offer'. The word 'Enterprise' continues the wrong positioning signal for a $100/month product targeting Shopify store owners.
 
Critical
Location: Pricing — Contact Email CTA   Type: Content / Technical
Current
Contact Sales button links to mailto:hello@yourdomain.com — this is a placeholder and is live in production.
Recommended
Replace with your real contact email or a link to a contact form page before going live. This is a trust-breaking issue for any visitor who clicks it.
 
What's working well in the pricing section:
• Three-product structure (ShopBot, SearchSync, SupportDesk) is clean and logical
• Feature lists are accurate and appropriately scoped
• 'Contact us' for custom pricing on the companion products is correct strategy
• 'Most popular' badge on the $100/mo card is well-placed
• Platform list (Shopify / WooCommerce / BigCommerce) is correctly shown

10. Footer

Medium
Location: Footer — Dead Links   Type: Content / Technical
Current
Twitter, Career, Policy, Blog, Community, Integration all link to #. 'Cover page' link exists with no clear purpose.
Recommended
Either (a) remove links that don't have a live destination yet, or (b) replace with a 'Coming soon' tooltip. Dead-linked footer items signal an incomplete product and erode trust. Remove 'Cover page' entirely — it has no meaning to a visitor.
 
Footer tagline: 'Convert every visitor into a customer with Neryn's conversion-focused AI assistants.' — This is actually good. Keep it.
 
Copyright line: '© 2026 Neryn. All rights reserved.' — Correct and clean.

11. Recommended Page Flow (After Fixes)

The current page flow was built for an enterprise SaaS product. Below is the recommended flow for a focused ecom chatbot tool:
 
#
Section
Purpose
1
Hero
Hook with outcome + show the product working in a real chat mockup
2
Problem Statement
'Shoppers leave because they're confused, not disinterested'
3
How It Works
3-step: Install → Sync → Sell. Simple, visual, fast.
4
Social Proof
Real brand logos OR stat bar (stores, assisted sales, rating)
5
Feature Grid
6 key features: intent reading, cart add, live sync, guardrails, multi-platform, tone
6
Integrations
Shopify, WooCommerce, BigCommerce, Gorgias, Klaviyo — logos the merchant knows
7
Results / Testimonial
Real merchant quote + 2–3 outcome metrics
8
Pricing
Current pricing section — keep, with minor fixes
9
FAQ
Rewritten 5 questions targeting store owner concerns
10
Final CTA
Strong conversion close — free trial, no CC required

12. Prioritised Action Plan

Actions are ordered by impact-to-effort ratio. Complete the Critical tier before launch/marketing.
 
Tier 1 — Fix Before Any Traffic (Do This Week)

ID
Action
Effort
Impact
C-09
Replace hello@yourdomain.com with real contact email
5 min
Critical
C-02
Fix typo: 'provided' → 'providing' in hero subhead
2 min
Critical
C-03
Rewrite hero chat mockup with a real product rec conversation
1 hr
Critical
C-01
Rewrite sections 3–7 with ecom-focused messaging (see Sec. 6)
4 hrs
Critical
C-04/05
Remove Fortune 500 headline + placeholder logo strip
30 min
Critical
C-08
Replace testimonial with ecom persona or remove section
30 min
High
H-05
Rewrite all 4 FAQ questions (see Section 8 table)
1 hr
High
H-06
Fix all dead nav links or remove items without live pages
1 hr
High
 
Tier 2 — Do Before Paid Marketing

• Replace hero stock photo with a product mockup showing the widget on a real Shopify store
• Replace generic integrations section (data warehouses, vector DBs) with ecom tools shoppers recognise (Shopify, WooCommerce, Gorgias, Klaviyo)
• Replace analytics section with merchant-facing chat analytics (top queries, conversion rates, catalog gaps)
• Replace enterprise analytics dashboard mockup with a real Neryn product screenshot or demo recording
• Change pricing tab label from 'Enterprise Choice' to 'Our Products'
 
Tier 3 — Growth Phase

• Add a live product demo (embedded chatbot on the landing page itself — the best possible proof)
• Collect 3–5 real Shopify merchant testimonials and replace the GlobalTech quote
• Build out blog/resources with content targeting 'best Shopify chatbot' and 'AI product recommendations' search terms
• Add a comparison table (Neryn vs. Tidio vs. Octane AI) — your pricing analysis supports this narrative
• Replace placeholder footer links with live pages (blog, careers if applicable)

Appendix — What Is Working Well

Not everything needs to change. The following elements are strong and should be preserved:
 
• Pricing section structure — three cards, feature lists, 'Most Popular' badge are all well executed
• Product names — ShopBot AI, SearchSync, SupportDesk AI are clear and memorable
• Footer tagline — 'Convert every visitor into a customer' is on-brand and accurate
• 14-day free trial offer — the right conversion mechanic for this price point
• The final CTA section headline — 'Join 450+ Shopify brands using Neryn AI to automate sales and support' — this is the most accurate sentence on the page; it should be moved higher
• Three-platform support (Shopify + WooCommerce + BigCommerce) is a genuine differentiator that deserves more prominence
• Copyright year (2026) is correct
 
 
End of Report
neryn.pro Website Audit · Prepared March 2026