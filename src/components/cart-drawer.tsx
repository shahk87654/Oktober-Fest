"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, LockKeyhole, Minus, Plus, X } from "lucide-react";
import { formatMoney, imageUrl } from "@/lib/format";
import { useCart } from "./cart-provider";

export function CartDrawer() {
  const { cart, isOpen, busy, error, closeCart, changeLine, removeLine } = useCart();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            aria-label="Close shopping bag"
            className="drawer-scrim"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reduceMotion ? 1 : 0 }}
            onClick={closeCart}
          />
          <motion.aside
            aria-label="Shopping bag"
            aria-modal="true"
            className="cart-drawer"
            initial={{ x: reduceMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : "100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
          >
            <header className="drawer-header">
              <div>
                <span className="eyebrow">THE ALPINE EDIT / SHOPPING BAG</span>
                <h2>Your bag <span>({cart?.totalQuantity ?? 0})</span></h2>
              </div>
              <button className="icon-button" aria-label="Close bag" onClick={closeCart}><X size={20} /></button>
            </header>
            <div className="drawer-lines">
              {!cart?.lines.nodes.length ? (
                <div className="empty-bag">
                  <span className="drawer-empty-mark" aria-hidden="true">A</span>
                  <p>Your bag is taking a moment to itself.</p>
                  <Link className="text-link" href="/collections" onClick={closeCart}>Explore the collections <ArrowRight size={14} /></Link>
                </div>
              ) : (
                cart.lines.nodes.map((line) => (
                  <article className="cart-line" key={line.id}>
                    <Link href={`/products/${line.merchandise.product.handle}`} onClick={closeCart} className="cart-line-image">
                      {line.merchandise.product.featuredImage && (
                        <Image
                          src={imageUrl(line.merchandise.image?.url ?? line.merchandise.product.featuredImage.url, 240)}
                          alt={line.merchandise.image?.altText ?? line.merchandise.product.featuredImage.altText ?? line.merchandise.product.title}
                          width={100}
                          height={126}
                        />
                      )}
                    </Link>
                    <div className="cart-line-info">
                      <span className="cart-line-vendor">{line.merchandise.product.vendor || "ALPINE ATELIER"}</span>
                      <div className="cart-line-title">
                        <Link href={`/products/${line.merchandise.product.handle}`} onClick={closeCart}>{line.merchandise.product.title}</Link>
                        <span>{formatMoney(line.cost.totalAmount)}</span>
                      </div>
                      <p className="muted small">{line.merchandise.title !== "Default Title" ? line.merchandise.title : "One size"}</p>
                      <div className="cart-line-actions">
                        <div className="quantity-control">
                          <button aria-label="Decrease quantity" disabled={busy} onClick={() => void changeLine(line.id, line.quantity - 1)}><Minus size={13} /></button>
                          <span>{line.quantity}</span>
                          <button aria-label="Increase quantity" disabled={busy} onClick={() => void changeLine(line.id, line.quantity + 1)}><Plus size={13} /></button>
                        </div>
                        <button className="remove-link" disabled={busy} onClick={() => void removeLine(line.id)}>Remove</button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
            {error && <p className="form-error drawer-error" role="alert">{error}</p>}
            {!!cart?.lines.nodes.length && (
              <footer className="drawer-footer">
                <span className="drawer-summary-label">ORDER SUMMARY</span>
                <div className="subtotal-row"><span>Subtotal</span><strong>{formatMoney(cart.cost.subtotalAmount)}</strong></div>
                <p className="muted small">Taxes and shipping are calculated at checkout.</p>
                <a className="button button-dark checkout-button" href={cart.checkoutUrl}>Continue to checkout <ArrowRight size={16} /></a>
                <div className="drawer-secure-note"><LockKeyhole size={13} />SECURE CHECKOUT THROUGH SHOPIFY</div>
                <button className="text-link continue-link" onClick={closeCart}>Continue shopping</button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
