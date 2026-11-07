import { shopifyFetch } from "./client";
import { SHOP_PAGE_QUERY, SHOP_PAYMENT_SETTINGS_QUERY, SHOP_POLICIES_QUERY } from "./queries";
import type { ShopifyPage, ShopifyPaymentSettings } from "./types";

export interface ShopifyPolicy {
  title: string;
  handle: string;
  body: string;
  url: string;
}

interface PoliciesResult {
  shop: {
    privacyPolicy: ShopifyPolicy | null;
    termsOfService: ShopifyPolicy | null;
    refundPolicy: ShopifyPolicy | null;
    shippingPolicy: ShopifyPolicy | null;
  };
}

export async function getShopContent(): Promise<PoliciesResult["shop"]> {
  const { shop } = await shopifyFetch<PoliciesResult>(SHOP_POLICIES_QUERY);
  return shop;
}

export async function getShopPaymentSettings(): Promise<ShopifyPaymentSettings> {
  const { shop } = await shopifyFetch<{ shop: { paymentSettings: ShopifyPaymentSettings } }>(SHOP_PAYMENT_SETTINGS_QUERY);
  return shop.paymentSettings;
}

export async function getShopPage(handle: string): Promise<ShopifyPage | null> {
  const { page } = await shopifyFetch<{ page: ShopifyPage | null }>(SHOP_PAGE_QUERY, { handle });
  return page;
}
