import type { ShopifyMoney } from "./shopify/types";

export function formatMoney(money: ShopifyMoney): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}

export function imageUrl(url: string, width = 900): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "cdn.shopify.com") {
      parsed.searchParams.set("width", String(width));
      parsed.searchParams.set("format", "webp");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
