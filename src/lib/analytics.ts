"use client";

type StorefrontEvent = "view_item" | "select_item" | "add_to_cart" | "begin_checkout" | "size_chart_open" | "measurement_saved";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    Shopify?: { analytics?: { publish: (name: string, payload: Record<string, unknown>) => void } };
  }
}

export function trackStorefrontEvent(name: StorefrontEvent, payload: Record<string, unknown>) {
  if (typeof window === "undefined" || window.localStorage.getItem("wiesn-analytics-consent") !== "granted") return;
  window.dataLayer?.push({ event: name, ...payload });
  window.gtag?.("event", name, payload);
  if (name === "add_to_cart") window.fbq?.("track", "AddToCart", payload);
  window.Shopify?.analytics?.publish(name, payload);
}
