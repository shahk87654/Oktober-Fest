export type GiftCandidate = {
  id: string;
  quantity: number;
  giftAttribute: string | null;
  isGiftProduct: boolean;
  isQualifyingProduct: boolean;
};

export type GiftTarget = { cartLineId: string; quantity: number };

export function getGiftDiscountTargets(lines: GiftCandidate[]): GiftTarget[] {
  const qualifyingQuantity = lines
    .filter((line) => line.isQualifyingProduct && line.giftAttribute !== "true")
    .reduce((total, line) => total + line.quantity, 0);
  if (qualifyingQuantity === 0) return [];

  let remaining = qualifyingQuantity;
  const targets: GiftTarget[] = [];
  for (const line of lines) {
    if (!line.isGiftProduct || line.giftAttribute !== "true" || remaining <= 0) continue;
    const quantity = Math.min(line.quantity, remaining);
    targets.push({ cartLineId: line.id, quantity });
    remaining -= quantity;
  }
  return targets;
}
