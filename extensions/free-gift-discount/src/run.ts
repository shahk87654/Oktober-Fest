type RunInput = {
  cart: {
    lines: {
      id: string;
      quantity: number;
      gift: { value: string } | null;
      merchandise: { product: { isGift: boolean; qualifies: boolean } };
    }[];
  };
};

type DiscountResult = {
  discounts: {
    message: string;
    targets: { cartLine: { id: string; quantity: number } }[];
    value: { percentage: { value: number } };
  }[];
  discountApplicationStrategy: "FIRST";
};

export function run(input: RunInput): DiscountResult {
  const eligibleQuantity = input.cart.lines
    .filter((line) => line.merchandise.product.qualifies && line.gift?.value !== "true")
    .reduce((quantity, line) => quantity + line.quantity, 0);
  let remaining = eligibleQuantity;
  const targets: DiscountResult["discounts"][number]["targets"] = [];

  for (const line of input.cart.lines) {
    if (!line.merchandise.product.isGift || line.gift?.value !== "true" || remaining <= 0) continue;
    const quantity = Math.min(line.quantity, remaining);
    targets.push({ cartLine: { id: line.id, quantity } });
    remaining -= quantity;
  }

  return targets.length
    ? {
        discounts: [{ message: "Complimentary Wiesn gift", targets, value: { percentage: { value: 100 } } }],
        discountApplicationStrategy: "FIRST",
      }
    : { discounts: [], discountApplicationStrategy: "FIRST" };
}
