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
