"use server";

import { addCartLine, getCart, removeCartLine, updateCartLine } from "@/lib/shopify/cart";

export async function getCartAction(cartId: string) {
  return getCart(cartId);
}

export async function addCartLineAction(cartId: string | null, variantId: string, quantity: number) {
  if (!variantId || !Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Choose an available option and a valid quantity.");
  }
  return addCartLine(cartId, variantId, quantity);
}

export async function updateCartLineAction(cartId: string, lineId: string, quantity: number) {
  if (!cartId || !lineId || !Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Invalid cart line update.");
  }
  return updateCartLine(cartId, lineId, quantity);
}

export async function removeCartLineAction(cartId: string, lineId: string) {
  if (!cartId || !lineId) throw new Error("Invalid cart line removal.");
  return removeCartLine(cartId, lineId);
}
