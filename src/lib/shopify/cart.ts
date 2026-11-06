import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { storefrontFetch } from "@/lib/shopify/client";
import {
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "@/lib/shopify/mutations";
import type { Cart } from "@/lib/shopify/types";

type UserError = { field: string[] | null; message: string; code: string | null };
type MutationResult = { cart: Cart | null; userErrors: UserError[] };
type CartResponse = { cart: Cart | null };

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
  attributes?: { key: string; value: string }[];
};

function assertMutation(result: MutationResult): Cart {
  if (result.userErrors.length) {
    throw new Error(result.userErrors.map(({ message }) => message).join("; "));
  }
  if (!result.cart) throw new Error("Shopify did not return a cart after the mutation.");
  return result.cart;
}

async function saveCartId(cartId: string) {
  const cookieStore = await cookies();
  cookieStore.set("wiesn_cart", cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function currentCartId() {
  const cookieStore = await cookies();
  return cookieStore.get("wiesn_cart")?.value;
}

export async function fetchCart(): Promise<Cart | null> {
  const cartId = await currentCartId();
  if (!cartId) return null;
  const response = await storefrontFetch<CartResponse, { id: string }>(CART_QUERY, { id: cartId });
  return response.cart;
}

export async function addLinesToCart(lines: CartLineInput[], countryCode = "US"): Promise<Cart> {
  const existingId = await currentCartId();
  const response = existingId
    ? await storefrontFetch<{ cartLinesAdd: MutationResult }, { cartId: string; lines: CartLineInput[] }>(
        CART_LINES_ADD_MUTATION, { cartId: existingId, lines },
      ).then(({ cartLinesAdd }) => cartLinesAdd)
    : await storefrontFetch<{ cartCreate: MutationResult }, { input: { lines: CartLineInput[]; buyerIdentity: { countryCode: string } } }>(
        CART_CREATE_MUTATION,
        { input: { lines, buyerIdentity: { countryCode } } },
      ).then(({ cartCreate }) => cartCreate);
  const cart = assertMutation(response);
  await saveCartId(cart.id);
  return cart;
}

export async function updateCartLines(
  lines: { id: string; quantity: number; attributes?: { key: string; value: string }[] }[],
): Promise<Cart> {
  const cartId = await currentCartId();
  if (!cartId) throw new Error("There is no active cart to update.");
  const { cartLinesUpdate } = await storefrontFetch<
    { cartLinesUpdate: MutationResult },
    { cartId: string; lines: typeof lines }
  >(CART_LINES_UPDATE_MUTATION, { cartId, lines });
  return assertMutation(cartLinesUpdate);
}

export async function removeCartLines(lineIds: string[]): Promise<Cart> {
  const cartId = await currentCartId();
  if (!cartId) throw new Error("There is no active cart to update.");
  const { cartLinesRemove } = await storefrontFetch<
    { cartLinesRemove: MutationResult },
    { cartId: string; lineIds: string[] }
  >(CART_LINES_REMOVE_MUTATION, { cartId, lineIds });
  return assertMutation(cartLinesRemove);
}

export async function updateBuyerIdentity(countryCode: string): Promise<Cart> {
  const cartId = await currentCartId();
  if (!cartId) throw new Error("There is no active cart to update.");
  const { cartBuyerIdentityUpdate } = await storefrontFetch<
    { cartBuyerIdentityUpdate: MutationResult },
    { cartId: string; buyerIdentity: { countryCode: string } }
  >(CART_BUYER_IDENTITY_UPDATE_MUTATION, { cartId, buyerIdentity: { countryCode } });
  return assertMutation(cartBuyerIdentityUpdate);
}

export async function setCartCountry(countryCode: string) {
  if (!/^[A-Z]{2}$/.test(countryCode)) throw new Error("Choose a valid two-letter country code.");
  if (!(await currentCartId())) return null;
  return updateBuyerIdentity(countryCode);
}

export async function getStoredCountry() {
  const cookieStore = await cookies();
  return cookieStore.get("wiesn_country")?.value ?? "US";
}

export const freeShippingThresholdUSD = env.FREE_SHIPPING_THRESHOLD_USD;
