export const IMAGE_FIELDS = `
  url
  altText
  width
  height
`;

export const VARIANT_FIELDS = `
  id
  title
  availableForSale
  sku
  price { amount currencyCode }
  compareAtPrice { amount currencyCode }
  selectedOptions { name value }
  image { ${IMAGE_FIELDS} }
`;

const PRODUCT_BASE_FIELDS = `
  id
  handle
  title
  description
  productType
  vendor
  tags
  availableForSale
  featuredImage { ${IMAGE_FIELDS} }
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  options { name values }
  seo { title description }
`;

export const PRODUCT_CARD_FIELDS = `
  ${PRODUCT_BASE_FIELDS}
  images(first: 2) { nodes { ${IMAGE_FIELDS} } }
  variants(first: 2) { nodes { ${VARIANT_FIELDS} } }
`;

export const PRODUCT_FIELDS = `
  ${PRODUCT_BASE_FIELDS}
  descriptionHtml
  images(first: 12) { nodes { ${IMAGE_FIELDS} } }
  variants(first: 250) {
    nodes { ${VARIANT_FIELDS} }
    pageInfo { hasNextPage endCursor }
  }
  metafields(identifiers: [
    { namespace: "custom", key: "materials" }
    { namespace: "custom", key: "care" }
    { namespace: "custom", key: "fit" }
    { namespace: "custom", key: "size_guide" }
    { namespace: "custom", key: "review_entries" }
    { namespace: "reviews", key: "rating" }
    { namespace: "reviews", key: "rating_count" }
  ]) { namespace key value }
  onlineStoreUrl
`;

export const COLLECTION_QUERY = `#graphql
  query CollectionByHandle(
    $handle: String!,
    $first: Int!,
    $after: String,
    $sortKey: ProductCollectionSortKeys,
    $reverse: Boolean,
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      image { ${IMAGE_FIELDS} }
      seo { title description }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        nodes { ${PRODUCT_CARD_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export const COLLECTIONS_QUERY = `#graphql
  query Collections($first: Int!) {
    collections(first: $first, sortKey: TITLE) {
      nodes {
        id
        handle
        title
        description
        image { ${IMAGE_FIELDS} }
      }
    }
  }
`;

export const PRODUCT_QUERY = `#graphql
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

export const RECENT_PRODUCTS_QUERY = `#graphql
  query RecentlyViewedProducts($first: Int!, $query: String!) {
    products(first: $first, query: $query) {
      nodes { ${PRODUCT_CARD_FIELDS} }
    }
  }
`;

export const PRODUCT_VARIANTS_QUERY = `#graphql
  query ProductVariantPage($id: ID!, $after: String!) {
    product(id: $id) {
      variants(first: 250, after: $after) {
        nodes { ${VARIANT_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) { ${PRODUCT_CARD_FIELDS} }
  }
`;

export const SEARCH_QUERY = `#graphql
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: [PRODUCT], unavailableProducts: HIDE) {
      nodes {
        ... on Product { ${PRODUCT_CARD_FIELDS} }
      }
    }
  }
`;

export const BLOG_ARTICLES_QUERY = `#graphql
  query JournalArticles($handle: String!, $first: Int!) {
    blog(handle: $handle) {
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          handle title excerpt contentHtml publishedAt
          image { ${IMAGE_FIELDS} }
          blog { handle title }
        }
      }
    }
  }
`;

export const BLOG_ARTICLE_QUERY = `#graphql
  query JournalArticle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        handle title excerpt contentHtml publishedAt
        image { ${IMAGE_FIELDS} }
        blog { handle title }
      }
    }
  }
`;

export const SHOP_POLICIES_QUERY = `#graphql
  query ShopPolicies {
    shop {
      privacyPolicy { title handle body url }
      termsOfService { title handle body url }
      refundPolicy { title handle body url }
      shippingPolicy { title handle body url }
    }
  }
`;

export const SHOP_PAYMENT_SETTINGS_QUERY = `#graphql
  query ShopPaymentSettings {
    shop {
      paymentSettings {
        acceptedCardBrands
        supportedDigitalWallets
      }
    }
  }
`;

export const SHOP_PAGE_QUERY = `#graphql
  query ShopPage($handle: String!) {
    page(handle: $handle) { title handle body seo { title description } }
  }
`;

export const CART_QUERY = `#graphql
  query Cart($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      totalQuantity
      cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
      lines(first: 50) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              ${VARIANT_FIELDS}
              product { handle title vendor featuredImage { ${IMAGE_FIELDS} } }
            }
          }
          cost { amountPerQuantity { amount currencyCode } totalAmount { amount currencyCode } }
        }
      }
    }
  }
`;
