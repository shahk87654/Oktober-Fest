export function formatMoney(
  money: { amount: string; currencyCode: string },
  locale = "en-US",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}

export function discountPercent(
  price: { amount: string },
  compareAtPrice: { amount: string } | null,
) {
  const priceAmount = Number(price.amount);
  const compareAmount = Number(compareAtPrice?.amount);
  if (!Number.isFinite(priceAmount) || !Number.isFinite(compareAmount) || compareAmount <= priceAmount) return null;
  return Math.round((1 - priceAmount / compareAmount) * 100);
}
