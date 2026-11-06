"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackStorefrontEvent } from "@/lib/analytics";
import type { Cart } from "@/lib/shopify/types";

export function CheckoutLink({
  cart,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { cart: Cart }) {
  return (
    <a
      {...props}
      href={cart.checkoutUrl}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) {
          trackStorefrontEvent("begin_checkout", {
            currency: cart.cost.totalAmount.currencyCode,
            value: Number(cart.cost.totalAmount.amount),
            items: cart.lines.nodes.map((line) => ({
              item_id: line.merchandise.id,
              item_name: line.merchandise.product.title,
              quantity: line.quantity,
            })),
          });
        }
      }}
    >
      {children}
    </a>
  );
}
