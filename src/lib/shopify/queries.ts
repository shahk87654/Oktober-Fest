export const IMAGE_FIELDS = `
  url
  altText
  width
  height
`;

export const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  descriptionHtml
  vendor
  productType
  availableForSale
  featuredImage { ${IMAGE_FIELDS} }
  images(first: 10) { nodes { ${IMAGE_FIELDS} } }
  options { id name values }
  variants(first: 100) {
    nodes {
      id title sku availableForSale
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
      image { ${IMAGE_FIELDS} }
    }
  }
  metafields(identifiers: [
    { namespace: "details", key: "material" }
    { namespace: "details", key: "fit" }
    { namespace: "details", key: "care" }
    { namespace: "details", key: "size_chart" }
    { namespace: "details", key: "size_chart_table" }
    { namespace: "details", key: "gift_belt_handle" }
    { namespace: "details", key: "gift_suspender_handle" }
    { namespace: "details", key: "true_to_size" }
    { namespace: "details", key: "color" }
    { namespace: "reviews", key: "rating" }
    { namespace: "reviews", key: "rating_count" }
  ]) {
    namespace key value type
    reference { ... on MediaImage { image { ${IMAGE_FIELDS} } } }
  }
  seo { title description }
`;

export const PRODUCT_QUERY = `query ProductByHandle($handle: String!) {
  product(handle: $handle) { ${PRODUCT_FIELDS} }
}`;

export const COLLECTION_QUERY = `query CollectionByHandle(
  $handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys,
  $reverse: Boolean, $filters: [ProductFilter!]
) {
  collection(handle: $handle) {
    id title handle description
    image { ${IMAGE_FIELDS} }
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
      nodes { ${PRODUCT_FIELDS} }
      pageInfo { hasNextPage endCursor }
    }
  }
}`;

export const FEATURED_COLLECTIONS_QUERY = `query FeaturedCollections($first: Int!) {
  collections(first: $first, sortKey: UPDATED_AT) {
    nodes { id title handle description image { ${IMAGE_FIELDS} } }
  }
}`;

export const ALL_PRODUCTS_QUERY = `query AllProductsForSitemap($first: Int!, $after: String) {
  products(first: $first, after: $after, sortKey: UPDATED_AT) {
    nodes { id handle updatedAt }
    pageInfo { hasNextPage endCursor }
  }
}`;

export const ALL_COLLECTIONS_QUERY = `query AllCollectionsForSitemap($first: Int!, $after: String) {
  collections(first: $first, after: $after, sortKey: UPDATED_AT) {
    nodes { id handle updatedAt }
    pageInfo { hasNextPage endCursor }
  }
}`;

export const RECOMMENDATIONS_QUERY = `query ProductRecommendations($productId: ID!) {
  productRecommendations(productId: $productId) { ${PRODUCT_FIELDS} }
}`;

export const PREDICTIVE_SEARCH_QUERY = `query PredictiveSearch($query: String!, $first: Int!) {
  predictiveSearch(query: $query, limit: $first, types: [PRODUCT, COLLECTION, ARTICLE]) {
    products { id title handle featuredImage { ${IMAGE_FIELDS} } }
    collections { id title handle }
    articles { id title handle }
  }
}`;

export const HOMEPAGE_QUERY = `query HomepageCollections($first: Int!) {
  collections(first: $first, sortKey: UPDATED_AT) {
    nodes {
      id title handle description image { ${IMAGE_FIELDS} }
      products(first: 8) { nodes { ${PRODUCT_FIELDS} } }
    }
  }
}`;

export const SHOP_BRAND_QUERY = `query StoreBrand {
  shop {
    name
    brand {
      logo { image { ${IMAGE_FIELDS} } }
    }
  }
}`;

export const ARTICLE_QUERY = `query ArticleByHandle($blog: String!, $handle: String!) {
  blog(handle: $blog) {
    articleByHandle(handle: $handle) {
      id title handle excerpt contentHtml publishedAt
      author { name }
      image { ${IMAGE_FIELDS} }
      blog { handle title }
    }
  }
}`;

export const ARTICLES_QUERY = `query BlogArticles($blog: String!, $first: Int!) {
  blog(handle: $blog) {
    title
    articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
      nodes {
        id title handle excerpt contentHtml publishedAt
        author { name }
        image { ${IMAGE_FIELDS} }
        blog { handle title }
      }
    }
  }
}`;

export const PAGE_QUERY = `query PageByHandle($handle: String!) {
  pageByHandle(handle: $handle) { id title handle body bodySummary seo { title description } }
}`;

export const METAOBJECT_QUERY = `query MetaobjectByHandle($type: String!, $handle: String!) {
  metaobject(handle: { type: $type, handle: $handle }) { id type handle fields { key value } }
}`;

export const METAOBJECTS_QUERY = `query MetaobjectsByType($type: String!, $first: Int!) {
  metaobjects(type: $type, first: $first) {
    nodes { id type handle fields { key value } }
  }
}`;
