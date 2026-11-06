"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  addLinesToCart,
  fetchCart,
  removeCartLines,
  updateCartLines,
} from "@/lib/shopify/cart";
import type { Cart } from "@/lib/shopify/types";

const lineSchema = z.object({
  merchandiseId: z.string().startsWith("gid://shopify/ProductVariant/"),
  quantity: z.number().int().min(1).max(99),
  attributes: z.array(z.object({ key: z.string().min(1), value: z.string().max(250) })).max(20).optional(),
});

export async function addToCartAction(rawLines: unknown, countryCode?: string): Promise<Cart> {
  const lines = z.array(lineSchema).min(1).max(20).parse(rawLines);
  const selectedCountry = countryCode ?? (await cookies()).get("wiesn_country")?.value ?? "US";
  if (!/^[A-Z]{2}$/.test(selectedCountry)) throw new Error("Choose a valid country.");
  const cart = await addLinesToCart(lines, selectedCountry);
  revalidatePath("/cart");
  return cart;
}

export async function updateCartAction(
  rawLines: unknown,
): Promise<Cart> {
  const lines = z.array(z.object({
    id: z.string().startsWith("gid://shopify/CartLine/"),
    quantity: z.number().int().min(0).max(99),
    attributes: z.array(z.object({ key: z.string(), value: z.string().max(250) })).optional(),
  })).min(1).max(100).parse(rawLines);
  const toRemove = lines.filter((line) => line.quantity === 0).map(({ id }) => id);
  let cart: Cart | null = null;
  if (toRemove.length) {
    const currentCart = await fetchCart();
    const removedLines = currentCart?.lines.nodes.filter((line) => toRemove.includes(line.id)) ?? [];
    const removedBundles = new Set(
      removedLines.flatMap((line) => line.attributes
        .filter((attribute) => attribute.key === "_gift_bundle")
        .map((attribute) => attribute.value)),
    );
    const attachedGiftIds = currentCart?.lines.nodes
      .filter((line) =>
        line.attributes.some((attribute) => attribute.key === "_gift" && attribute.value === "true") &&
        line.attributes.some((attribute) => attribute.key === "_gift_bundle" && removedBundles.has(attribute.value)),
      )
      .map((line) => line.id) ?? [];
    cart = await removeCartLines([...new Set([...toRemove, ...attachedGiftIds])]);
  }
  const toUpdate = lines.filter((line) => line.quantity > 0);
  if (toUpdate.length) cart = await updateCartLines(toUpdate);
  if (!cart) cart = await fetchCart();
  if (!cart) throw new Error("The cart is empty.");
  revalidatePath("/cart");
  return cart;
}
