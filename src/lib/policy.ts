import "server-only";
import { env, shopifyConfigured } from "@/lib/env";
import { getMetaobject } from "@/lib/shopify/storefront";

export type StorePolicy = {
  shippingThresholdUSD: number;
  shippingThresholds: Record<string, number | null>;
  returnWindowDays: number;
  shippingCopy: string;
  returnsCopy: string;
  customFitCopy: string;
  leadTimeBusinessDays: number | null;
  transitMinBusinessDays: number | null;
  transitMaxBusinessDays: number | null;
};

const fallbackPolicy: StorePolicy = {
  shippingThresholdUSD: env.FREE_SHIPPING_THRESHOLD_USD,
  shippingThresholds: {
    USD: env.FREE_SHIPPING_THRESHOLD_USD,
    EUR: null,
    GBP: null,
    CAD: null,
    AUD: null,
    NZD: null,
    CHF: null,
  },
  returnWindowDays: 14,
  shippingCopy: "Available shipping options, delivery estimates and duties are shown at checkout.",
  returnsCopy: "Eligible, unworn items may be returned within 14 days of delivery. Custom-made and final-sale items are not returnable unless faulty.",
  customFitCopy: "If you provide exact measurements, we will confirm your fit by email before dispatch.",
  leadTimeBusinessDays: null,
  transitMinBusinessDays: null,
  transitMaxBusinessDays: null,
};

export async function getStorePolicy(): Promise<StorePolicy> {
  if (!shopifyConfigured) return fallbackPolicy;
  const policy = await getMetaobject<{
    id: string;
    free_shipping_threshold_usd: string;
    return_window_days: string;
    shipping_copy: string;
    returns_copy: string;
    custom_fit_copy: string;
    lead_time_business_days?: string;
    transit_min_business_days?: string;
    transit_max_business_days?: string;
    free_shipping_threshold_eur?: string;
    free_shipping_threshold_gbp?: string;
    free_shipping_threshold_cad?: string;
    free_shipping_threshold_aud?: string;
    free_shipping_threshold_nzd?: string;
    free_shipping_threshold_chf?: string;
  }>("store_policy", "shipping-and-returns");
  if (!policy) return fallbackPolicy;
  const threshold = Number(policy.free_shipping_threshold_usd);
  const days = Number(policy.return_window_days);
  const usd = Number.isFinite(threshold) && threshold > 0 ? threshold : fallbackPolicy.shippingThresholdUSD;
  const thresholds = {
    USD: usd,
    EUR: parsePositive(policy.free_shipping_threshold_eur),
    GBP: parsePositive(policy.free_shipping_threshold_gbp),
    CAD: parsePositive(policy.free_shipping_threshold_cad),
    AUD: parsePositive(policy.free_shipping_threshold_aud),
    NZD: parsePositive(policy.free_shipping_threshold_nzd),
    CHF: parsePositive(policy.free_shipping_threshold_chf),
  };
  return {
    shippingThresholdUSD: usd,
    shippingThresholds: thresholds,
    returnWindowDays: Number.isFinite(days) && days >= 0 ? days : fallbackPolicy.returnWindowDays,
    shippingCopy: policy.shipping_copy || fallbackPolicy.shippingCopy,
    returnsCopy: policy.returns_copy || fallbackPolicy.returnsCopy,
    customFitCopy: policy.custom_fit_copy || fallbackPolicy.customFitCopy,
    leadTimeBusinessDays: parseNonnegativeInteger(policy.lead_time_business_days),
    transitMinBusinessDays: parseNonnegativeInteger(policy.transit_min_business_days),
    transitMaxBusinessDays: parseNonnegativeInteger(policy.transit_max_business_days),
  };
}

export const defaultStorePolicy = fallbackPolicy;

function parseNonnegativeInteger(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function parsePositive(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
