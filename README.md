# Alpine Atelier storefront

A Next.js App Router storefront with a Shopify Storefront API catalog and Shopify-hosted checkout.

## Getting started

1. Copy `.env.example` to `.env.local`.
2. Set `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, and `SHOPIFY_API_VERSION`.
3. Set the collection handles to collections published to the Storefront API.
4. Run `npm install` and `npm run dev`.

The Storefront API token is server-only. Product, collection, price, variant, inventory, cart, policy, page, and journal data is fetched from Shopify. Collection and campaign copy handles are configured with public environment variables. Hero/campaign image URLs can point to Shopify Files (Shopify CDN URLs are allowed).

## Validation

Run `npm run typecheck`, `npm run lint`, and `npm run build`.

Deploy to Vercel with the same environment variables configured in the project settings.

## Product reviews

The product page reads written reviews from a Shopify product metafield named `custom.review_entries`. Define it as a JSON metafield and enable Storefront API access. Its value must be an array of customer-submitted reviews with an author, a numeric 1–5 rating, and review text:

```json
[
  {
    "id": "review-001",
    "author": "Customer name",
    "rating": 5,
    "title": "A considered detail",
    "body": "The review text submitted by the customer.",
    "date": "2026-10-12"
  }
]
```

The storefront also reads Shopify's standard `reviews.rating` and `reviews.rating_count` metafields for an aggregate summary when available. Reviews are never generated or seeded by the storefront. Shopify's former Product Reviews app does not provide a Storefront review feed, so written reviews must be stored in the product metafield or synced there from a review provider.

## Size advisor

The product page's **Find my size** flow supports a quick estimate and guided exact measurements. The recommendation engine is pure TypeScript (`src/lib/size-engine.ts`); the shopper's optional saved profile is stored only in their browser. The demo is at `/size-advisor-demo`. Run `npm test` for recommendation tests.

### Shopify chart metafield

For each product, open **Settings → Custom data → Products → Add definition** and create:

- Name: `Size chart`
- Namespace and key: `custom.size_chart`
- Type: **JSON**
- Storefront API access: enabled

Paste a chart shaped like `src/lib/seed-size-charts.json`. Each chart row's `body_ranges` are body measurements in centimetres (not garment dimensions); add actual garment dimensions in `garment_measurements`, and set the product's stretch, fit type, and adjustability accurately. The Storefront query reads this metafield and refreshes through the existing 60-second Shopify fetch revalidation. The shipped charts are illustrative only; they are not certified against a standard and must be replaced with brand fit data before production.

Collection fallbacks are in `src/lib/default-size-charts.ts` for dirndls, blouses, aprons, lederhosen, shirts, and Jankers. EU sizes are included alongside approximate US/UK conversions. Product-specific Shopify JSON takes precedence.

### Privacy, accounts, and feedback

Measurements are not sent to the server. The save checkbox opts into local browser storage; **Delete my data** removes the saved profile. This storefront currently has no customer-account authentication, so syncing a profile to a Shopify customer metafield is intentionally not enabled. Once authenticated customer access is added, persist only after explicit consent, scope access to the signed-in customer, and expose deletion.

The UI emits `advisor_opened`, `profile_completed`, `size_recommended`, `size_applied`, and `add_to_cart_after_advisor` browser events for an analytics adapter. `FitFeedbackSurvey` emits `fit_feedback_submitted`; connect it to a post-purchase / order-status surface and a consented backend (for example a Supabase table) before using feedback for size offsets. No order or return data is collected by this implementation.

### Adding a scan provider later

Implement `ScanProvider` from `src/lib/scan-provider.ts` for a vendor SDK/API, then inject the provider into the drawer's future scan step. Its `start()` method should return normalized centimetre measurements and a confidence value. Keep vendor credentials server-side and obtain explicit consent before transmitting a scan; this UI does not collect photos or activate a scan.
