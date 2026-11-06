export type Money = { amount: string; currencyCode: string };
export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};
export type SelectedOption = { name: string; value: string };
export type ProductVariant = {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: SelectedOption[];
  image: ShopifyImage | null;
};
export type ProductMetafield = {
  namespace: string;
  key: string;
  value: string;
  type: string;
  reference?: { image: ShopifyImage | null } | null;
};
export type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  options: { id: string; name: string; values: string[] }[];
  variants: { nodes: ProductVariant[] };
  metafields: (ProductMetafield | null)[];
  seo: { title: string | null; description: string | null };
};
export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: { title: string; handle: string; featuredImage: ShopifyImage | null };
    selectedOptions: SelectedOption[];
    price: Money;
  };
  cost: { totalAmount: Money };
  attributes: { key: string; value: string }[];
};
export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  buyerIdentity: { countryCode: string | null };
  cost: { subtotalAmount: Money; totalAmount: Money };
  lines: { nodes: CartLine[] };
};
export type StorefrontConnection<T> = { nodes: T[]; pageInfo?: { hasNextPage: boolean; endCursor: string | null } };
export type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
  products: StorefrontConnection<Product>;
};
export type Article = {
  id: string;
  title: string;
  handle: string;
  excerpt: string;
  contentHtml: string;
  publishedAt: string;
  author: { name: string };
  image: ShopifyImage | null;
  blog: { handle: string; title: string };
};
