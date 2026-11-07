export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyPaymentSettings {
  acceptedCardBrands: string[];
  supportedDigitalWallets: string[];
}

export interface ShopifyPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ShopifyConnection<T> {
  nodes: T[];
  pageInfo?: ShopifyPageInfo;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  sku: string | null;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: ShopifySelectedOption[];
  image: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  productType: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: ShopifyConnection<ShopifyImage>;
  priceRange: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney };
  compareAtPriceRange: { minVariantPrice: ShopifyMoney | null };
  options: Array<{ name: string; values: string[] }>;
  variants: ShopifyConnection<ShopifyVariant>;
  seo: { title: string | null; description: string | null };
  metafields?: Array<{ namespace: string; key: string; value: string } | null>;
  onlineStoreUrl?: string | null;
}

export interface ShopifyCollectionSummary {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: ShopifyImage | null;
  seo: { title: string | null; description: string | null };
  products: ShopifyConnection<ShopifyProduct>;
}

export interface ShopifyFilterValue {
  id: string;
  label: string;
  count?: number;
  input: string;
}

export interface ShopifyFilter {
  id: string;
  label: string;
  type: string;
  values: ShopifyFilterValue[];
}

export interface ShopifyArticle {
  handle: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  publishedAt: string;
  image: ShopifyImage | null;
  blog: { handle: string; title: string };
}

export interface ShopifyPage {
  title: string;
  handle: string;
  body: string;
  seo: { title: string | null; description: string | null };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: ShopifyVariant & {
    product: Pick<ShopifyProduct, "handle" | "title" | "vendor" | "featuredImage">;
  };
  cost: { amountPerQuantity: ShopifyMoney; totalAmount: ShopifyMoney };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney };
  lines: ShopifyConnection<ShopifyCartLine>;
}
