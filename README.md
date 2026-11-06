# Oktoberfest Outfits storefront

A server-rendered, headless Bavarian apparel storefront built with Next.js App Router, TypeScript, Tailwind CSS, Shopify Storefront API and Shopify Customer Account API.

## What is included

- Editorial homepage, collection, product, search, cart, policy, content, journal and customer account routes.
- Server-only Shopify GraphQL requests with typed inputs/outputs, fetch tags and Shopify webhook revalidation.
- Shopify product variants, localization context, price/availability display, cookie-backed carts and Server Action mutations.
- Product option URLs (`?leather=cow&size=34`), inventory-aware choices, exact-measurement line attributes, gift lines and an accompanying Shopify Discount Function.
- Cookie-consent-gated GA4, Meta Pixel and Shopify analytics events.
- Shopify CDN image domains, `next/image`, `next/font`, metadata, product/article/breadcrumb/FAQ structured data, sitemap and robots.
- Accessible menus, dialogs, keyboard-operable product option groups, reduced-motion handling and explicit empty/configuration states.

The storefront does not invent products, stock, reviews or size measurements. Without Shopify credentials, the editorial pages render and commerce routes explain which integration is not configured; add live data in the Shopify setup below.

## Requirements

- Node.js 22.18 or newer
- npm
- A Shopify development store with Storefront API access

## Local setup

1. Install packages:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the server-only Storefront API values and public site URL.

3. Configure Shopify as described in [Shopify setup](#shopify-setup).

4. Generate the current Storefront schema/operation types:

   ```sh
   npm run codegen
   ```

   Code generation reads the authenticated Storefront schema using `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, and `SHOPIFY_API_VERSION`.

5. Start the development server:

   ```sh
   npm run dev
   ```

6. Validate changes:

   ```sh
   npm run typecheck
   npm test
   npm run lint
   npm run build
   ```

   Playwright purchase-flow tests run against a real Shopify test store. Set `E2E_PRODUCT_HANDLE`, `E2E_LEATHER`, `E2E_SIZE`, and `E2E_GIFT_TITLE` before `npm run test:e2e`. Do not point these tests at a live production store.

## Shopify setup

### 1. Create a custom app and Storefront token

In Shopify Admin, create a custom app and configure its Storefront API access. Enable the scopes needed by the storefront:

- `unauthenticated_read_product_listings` — products, variants and collections
- `unauthenticated_read_metaobjects` — merchandising, policy and PDP configuration
- `unauthenticated_read_content` — Shopify pages and blog articles
- `unauthenticated_write_checkouts` — cart mutations and checkout handoff where required by the shop configuration
- `unauthenticated_read_customers` and `unauthenticated_write_customers` — newsletter `customerCreate` mutation

Create a Storefront API access token, then set:

```text
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_API_VERSION=2026-10
```

The storefront reads product and collection photography directly from Shopify's product media and collection images. Upload a logo in Shopify's Brand settings to use it in the header/footer; if none is configured, the shop name is used as the wordmark. This Storefront token does not have the optional `unauthenticated_read_product_inventory` scope, so low-stock quantities are not queried or displayed; availability still comes from Shopify variant availability.

Keep the Storefront token and webhook secret server-side. Do not expose them through `NEXT_PUBLIC_*`.

### 2. Product data conventions

- Use the URL structure `/collections/{handle}`, `/products/{handle}`, `/pages/{handle}`, `/blogs/news`, `/blogs/news/{handle}`, `/cart`, and `/policies/{handle}`.
- PDP option names should be `Leather Type` and `Size`. The PDP reads real option values and resolves the matching variant from the URL.
- Add tags `wiesn-gift-qualifying` to qualifying outfit products and `wiesn-free-gift` to eligible gift products. The discount Function also requires the gift line `_gift=true` attribute.
- Create these product metafields (namespace `details` unless noted): `material` (multi-line text), `fit` (multi-line text), `care` (multi-line text), `size_chart` (file reference to an image), `size_chart_table` (JSON), `true_to_size` (single-line text), `color` (single-line text), `gift_belt_handle` (single-line text), and `gift_suspender_handle` (single-line text). For reviews, use namespace `reviews` with `rating` (number decimal) and `rating_count` (number integer).
- `size_chart_table` is a JSON array with objects shaped as `{ "size": "34", "waist": "86–90", "hip": "…", "chest": "…" }`; values must come from the actual garment measurement chart.

### 3. Create metaobject definitions and entries

Create definitions matching [`shopify/metaobjects.json`](./shopify/metaobjects.json), with Storefront access enabled. Add these entries/handles:

| Type | Handle(s) | Used for |
|---|---|---|
| `hero_slide` | `hero-1`, `hero-2`, `hero-3` | Homepage slides; image URLs must be Shopify CDN HTTPS URLs |
| `announcement` | `global` | Announcement marquee copy |
| `countdown_config` | `oktoberfest` | Festival title, start/end timestamps and ended state |
| `store_policy` | `shipping-and-returns` | Single policy, currency thresholds, returns and delivery estimates |
| `pdp_offer` | Each matching product handle | Seasonal copy, CTA and gift product handles/values |
| `faq_item` | One entry per FAQ | FAQ question, answer and sort order |
| `material` | One entry per material | Material description, texture, care and durability |
| `ugc_item` | One per customer image | UGC; publish only when the customer has given permission |
| `home_section` | One per section | Optional structured home content |

Use the policy metaobject for the real return eligibility, made-to-measure/final-sale language, free-shipping thresholds (one value per currency), preparation lead time and transit-time range. The app uses a clearly stated local fallback until the metaobject exists. Keep policy wording consistent with Shopify checkout, order notification templates and customer support.

### 4. Set up Customer Account API

Enable the new Customer Account API in Shopify Admin and register:

```text
https://your-domain.example/account/callback
```

Copy the app client ID, authorization endpoint, token endpoint and Customer Account GraphQL endpoint from the account API configuration into the matching `SHOPIFY_CUSTOMER_ACCOUNT_*` environment variables. The login route uses authorization code + PKCE, state verification and an HttpOnly token cookie. Restrict redirect URLs to the deployed storefront URL.

### 5. Add Shopify webhooks

Point webhooks at `https://your-domain.example/api/webhooks/shopify` and use the Shopify app client secret as `SHOPIFY_WEBHOOK_SECRET`. Subscribe to:

- `products/create`, `products/update`, `products/delete`
- `collections/create`, `collections/update`, `collections/delete`
- `articles/create`, `articles/update`, `articles/delete`
- `metaobjects/create`, `metaobjects/update`, `metaobjects/delete`

The route verifies `X-Shopify-Hmac-Sha256` over the raw request body before invalidating cache tags.

### 6. Deploy the complimentary-gift Function

The source is in [`extensions/free-gift-discount`](./extensions/free-gift-discount). Add it to the Shopify app used by the store, build it with Shopify CLI, deploy it, and create/enable an automatic app discount using the Function. The Function discounts only gift-tagged lines marked `_gift=true`, and caps free quantities at the qualifying outfit quantity. Test eligibility, partial quantities and removal behavior on a development store before enabling the offer.

The Storefront cart adds the outfit and configured belt/suspender gift variants in one `cartLinesAdd` mutation. Gift lines carry a private bundle marker; removing the parent line also removes its associated gifts. Install and activate the Function before advertising the gift promotion.

### 7. Configure analytics and consent

Set `NEXT_PUBLIC_GA_ID` and/or `NEXT_PUBLIC_META_PIXEL_ID` only when those properties are configured. The client defers optional tracking until the visitor grants analytics consent. Shopify storefront events are published through the same consent gate.

## Custom measurements in order emails

Measurements are sent as cart line attributes and remain visible in cart/checkout. If your Shopify order confirmation template lists line item properties, include a measurement section using the platform’s `line.properties` data, for example:

```liquid
{% for line in line_items %}
  {% assign has_measurements = false %}
  {% for property in line.properties %}
    {% if property.first contains 'Measurement:' %}
      {% assign has_measurements = true %}
    {% endif %}
  {% endfor %}
  {% if has_measurements %}
    <p><strong>Fit measurements for {{ line.title }}</strong></p>
    {% for property in line.properties %}
      {% if property.first contains 'Measurement:' %}
        <p>{{ property.first | remove: 'Measurement: ' }}: {{ property.last }}</p>
      {% endif %}
    {% endfor %}
    <p>Our team will confirm the size by email before dispatch.</p>
  {% endif %}
{% endfor %}
```

Preview the notification with a test order; Shopify notification templates can differ by checkout configuration.

## Vercel deployment

1. Import the repository into Vercel and select the Next.js framework preset.
2. Add every required production variable from `.env.example` in Vercel Project Settings. Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin.
3. Deploy a preview first and verify product/collection data, customer OAuth, checkout, consent, webhooks and sitemap.
4. Register the production OAuth callback and webhook URL in Shopify. Do not reuse preview credentials or test orders for production.
5. In Shopify, enable the deployed gift discount Function only after validating it against the current offer and product tags.

## Project commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local Next.js server |
| `npm run build` | Production build |
| `npm run typecheck` | Strict TypeScript check |
| `npm run lint` | ESLint |
| `npm run codegen` | Generate Storefront GraphQL schema and operation types |
| `npm test` | Variant and gift eligibility unit tests |
| `npm run test:e2e` | Configured Shopify development-store cart flow |
