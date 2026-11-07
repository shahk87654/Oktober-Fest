import "server-only";
import { shopifyFetch } from "./client";
import { CART_QUERY } from "./queries";
import {
  CART_CREATE_SIMPLE,
  CART_LINES_ADD,
  CART_LINES_REMOVE,
  CART_LINES_UPDATE,
} from "./mutations";
import type { ShopifyCart } from "./types";

interface CartResult {
  cart: ShopifyCart | null;
}

interface CartMutationResult {
  cartCreate?: { cart: ShopifyCart | null; userErrors: Array<{ message: string }> };
  cartLinesAdd?: { cart: Pick<ShopifyCart, "id"> | null; userErrors: Array<{ message: string }> };
  cartLinesUpdate?: { cart: Pick<ShopifyCart, "id"> | null; userErrors: Array<{ message: string }> };
  cartLinesRemove?: { cart: Pick<ShopifyCart, "id"> | null; userErrors: Array<{ message: string }> };
}

async function fetchCart(id: string): Promise<ShopifyCart | null> {
  const { cart } = await shopifyFetch<CartResult>(CART_QUERY, { id }, { cache: "no-store" });
  return cart;
}

async function assertMutation(
  query: string,
  variables: Record<string, unknown>,
  field: keyof CartMutationResult,
): Promise<string> {
  const result = await shopifyFetch<CartMutationResult>(query, variables, { cache: "no-store" });
  const mutation = result[field];
  if (!mutation) throw new Error("Shopify cart mutation returned no result.");
  if (mutation.userErrors.length) {
    throw new Error(mutation.userErrors.map((error) => error.message).join("; "));
  }
  if (!mutation.cart) throw new Error("Shopify cart mutation returned no cart.");
  return mutation.cart.id;
}

export async function getCart(id: string): Promise<ShopifyCart | null> {
  return fetchCart(id);
}

export async function addCartLine(
  cartId: string | null,
  merchandiseId: string,
  quantity: number,
): Promise<ShopifyCart> {
  if (cartId) {
    const id = await assertMutation(
      CART_LINES_ADD,
      { cartId, lines: [{ merchandiseId, quantity }] },
      "cartLinesAdd",
    );
    return (await fetchCart(id)) ?? Promise.reject(new Error("Unable to retrieve the updated cart."));
  }

  const result = await shopifyFetch<CartMutationResult>(
    CART_CREATE_SIMPLE,
    { input: { lines: [{ merchandiseId, quantity }] } },
    { cache: "no-store" },
  );
  const created = result.cartCreate;
  if (!created) throw new Error("Shopify cart creation returned no result.");
  if (created.userErrors.length) {
    throw new Error(created.userErrors.map((error) => error.message).join("; "));
  }
  if (!created.cart) throw new Error("Shopify did not return the new cart.");
  return created.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<ShopifyCart> {
  if (quantity < 1) {
    await assertMutation(CART_LINES_REMOVE, { cartId, lineIds: [lineId] }, "cartLinesRemove");
  } else {
    await assertMutation(
      CART_LINES_UPDATE,
      { cartId, lines: [{ id: lineId, quantity }] },
      "cartLinesUpdate",
    );
  }
  return (await fetchCart(cartId)) ?? Promise.reject(new Error("Unable to retrieve the updated cart."));
}

export async function removeCartLine(cartId: string, lineId: string): Promise<ShopifyCart> {
  await assertMutation(CART_LINES_REMOVE, { cartId, lineIds: [lineId] }, "cartLinesRemove");
  return (await fetchCart(cartId)) ?? Promise.reject(new Error("Unable to retrieve the updated cart."));
}
