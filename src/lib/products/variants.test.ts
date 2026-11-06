import { describe, expect, it } from "vitest";
import { firstAvailableVariant, productBenefits, resolveVariant, selectionFromVariant } from "@/lib/products/variants";
import { getGiftDiscountTargets } from "@/lib/products/gift-rule";
import type { ProductVariant } from "@/lib/shopify/types";

const variants: ProductVariant[] = [
  { id: "gid://shopify/ProductVariant/1", title: "Cow / 32", sku: "C32", availableForSale: true, quantityAvailable: 4, price: { amount: "240", currencyCode: "USD" }, compareAtPrice: null, selectedOptions: [{ name: "Leather Type", value: "Cow" }, { name: "Size", value: "32" }], image: null },
  { id: "gid://shopify/ProductVariant/2", title: "Goat / 34", sku: "G34", availableForSale: false, quantityAvailable: 0, price: { amount: "250", currencyCode: "USD" }, compareAtPrice: { amount: "275", currencyCode: "USD" }, selectedOptions: [{ name: "Leather Type", value: "Goat" }, { name: "Size", value: "34" }], image: null },
];

describe("product variant selection", () => {
  it("resolves the exact leather and size combination", () => {
    expect(resolveVariant(variants, { "Leather Type": "Goat", Size: "34" })?.id).toBe(variants[1]?.id);
  });

  it("does not mistake an unavailable variant for an available one", () => {
    expect(resolveVariant(variants, { "Leather Type": "Goat", Size: "34" })?.availableForSale).toBe(false);
    expect(firstAvailableVariant(variants)?.id).toBe(variants[0]?.id);
  });

  it("round-trips variant options into shareable option state", () => {
    expect(selectionFromVariant(variants[0] ?? null)).toEqual({ "Leather Type": "Cow", Size: "32" });
  });

  it("renders leather-specific benefit copy without template brackets", () => {
    for (const sentence of productBenefits("Goat")) {
      expect(sentence).not.toMatch(/[\[\]]/);
    }
    expect(productBenefits("Goat")[0]).toContain("goat");
  });
});

describe("gift discount qualification", () => {
  it("discounts only tagged gift lines while a qualifying outfit is present", () => {
    expect(getGiftDiscountTargets([
      { id: "outfit", quantity: 1, giftAttribute: null, isGiftProduct: false, isQualifyingProduct: true },
      { id: "gift", quantity: 1, giftAttribute: "true", isGiftProduct: true, isQualifyingProduct: false },
    ])).toEqual([{ cartLineId: "gift", quantity: 1 }]);
  });

  it("does not discount unmarked gifts or gifts without a qualifying outfit", () => {
    expect(getGiftDiscountTargets([
      { id: "gift", quantity: 2, giftAttribute: "true", isGiftProduct: true, isQualifyingProduct: false },
    ])).toEqual([]);
  });

  it("caps discounted gift quantity at the number of qualifying outfits", () => {
    expect(getGiftDiscountTargets([
      { id: "outfit", quantity: 1, giftAttribute: null, isGiftProduct: false, isQualifyingProduct: true },
      { id: "gifts", quantity: 3, giftAttribute: "true", isGiftProduct: true, isQualifyingProduct: false },
    ])).toEqual([{ cartLineId: "gifts", quantity: 1 }]);
  });
});
