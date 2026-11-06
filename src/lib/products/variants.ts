import type { ProductVariant, SelectedOption } from "@/lib/shopify/types";

export function resolveVariant(
  variants: ProductVariant[],
  selectedOptions: Record<string, string>,
) {
  return variants.find((variant) =>
    variant.selectedOptions.every((option) => selectedOptions[option.name] === option.value),
  ) ?? null;
}

export function firstAvailableVariant(variants: ProductVariant[]) {
  return variants.find((variant) => variant.availableForSale) ?? variants[0] ?? null;
}

export function selectionFromVariant(variant: ProductVariant | null): Record<string, string> {
  return Object.fromEntries(
    (variant?.selectedOptions ?? []).map(({ name, value }: SelectedOption) => [name, value]),
  );
}

export function productBenefits(leather: string) {
  return [
    `Soft, supple ${leather.toLowerCase()} that develops character with every wear.`,
    "A considered fit that gives you room to move and room to celebrate.",
    "Traditional details, finished by hand with care.",
    "Made to feel right from your first festival to your fiftieth.",
    "Easy to style with the pieces already in your wardrobe.",
    "A memorable gift, ready for the next gathering.",
  ];
}
