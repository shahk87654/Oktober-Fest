"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { formatMoney, imageUrl } from "@/lib/format";
import { useCart } from "./cart-provider";

const FREE_SHIPPING_THRESHOLD = 150;

export function CartDrawer() {
  const { cart, isOpen, busy, error, closeCart, changeLine, removeLine } = useCart();
  const reduceMotion = useReducedMotion();

  const subtotalNumber = Number(cart?.cost?.subtotalAmount?.amount ?? 0);
  const currencyCode = cart?.cost?.subtotalAmount?.currencyCode ?? "USD";
  const progressPercent = Math.min(100, Math.round((subtotalNumber / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalNumber);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            aria-label="Close shopping bag"
            className="drawer-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            aria-label="Shopping bag"
            aria-modal="true"
            className="cart-drawer"
            initial={{ x: reduceMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : "100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
          >
            <header className="drawer-header">
              <div>
                <span className="eyebrow">
                  <i /> YOUR SHOPPING BAG
                </span>
                <h2>
                  Shopping Bag <span>({cart?.totalQuantity ?? 0})</span>
                </h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close bag"
                onClick={closeCart}
              >
                <X size={20} />
              </button>
            </header>

            {/* Free Shipping Progress Meter */}
            {!!cart?.lines.nodes.length && (
              <div className="my-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
                <div className="flex items-center justify-between mb-1.5 font-semibold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <Truck size={14} className="text-emerald-700" />
                    {remainingForFreeShipping === 0 ? (
                      <span className="font-bold flex items-center gap-1 text-emerald-800">
                        <CheckCircle2 size={13} /> You unlocked Free Express Shipping!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-emerald-800">${remainingForFreeShipping.toFixed(2)}</strong> for Free Express Shipping
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-emerald-800">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-200/60 overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            <div className="drawer-lines">
              {!cart?.lines.nodes.length ? (
                <div className="empty-bag">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                    <ShoppingBag size={28} />
                  </div>
                  <p className="font-serif text-2xl text-slate-900 m-0">Your bag is currently empty.</p>
                  <p className="text-xs text-slate-500 max-w-xs -mt-2">
                    Explore our Oktoberfest 2026 collection and find authentic Bavarian pieces.
                  </p>
                  <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
                    <Link
                      className="button button-dark"
                      href="/collections/men"
                      onClick={closeCart}
                    >
                      <span>Explore Men&apos;s Collection</span>
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      className="button button-light"
                      href="/collections/women"
                      onClick={closeCart}
                    >
                      <span>Explore Women&apos;s Dirndls</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : (
                cart.lines.nodes.map((line) => (
                  <article className="cart-line" key={line.id}>
                    <Link
                      href={`/products/${line.merchandise.product.handle}`}
                      onClick={closeCart}
                      className="cart-line-image"
                    >
                      {line.merchandise.product.featuredImage ? (
                        <Image
                          src={imageUrl(
                            line.merchandise.image?.url ?? line.merchandise.product.featuredImage.url,
                            240,
                          )}
                          alt={
                            line.merchandise.image?.altText ??
                            line.merchandise.product.featuredImage.altText ??
                            line.merchandise.product.title
                          }
                          width={88}
                          height={112}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <Sparkles size={20} />
                        </div>
                      )}
                    </Link>
                    <div className="cart-line-info">
                      <div>
                        <span className="cart-line-vendor">
                          {line.merchandise.product.vendor || "ALPINE ATELIER"}
                        </span>
                        <div className="cart-line-title">
                          <Link
                            href={`/products/${line.merchandise.product.handle}`}
                            onClick={closeCart}
                            className="hover:text-emerald-800 transition-colors"
                          >
                            {line.merchandise.product.title}
                          </Link>
                          <span>{formatMoney(line.cost.totalAmount)}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {line.merchandise.title !== "Default Title" ? line.merchandise.title : "Standard Edition"}
                        </p>
                      </div>

                      <div className="cart-line-actions">
                        <div className="quantity-control">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={busy}
                            onClick={() => void changeLine(line.id, line.quantity - 1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span>{line.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={busy}
                            onClick={() => void changeLine(line.id, line.quantity + 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="remove-link inline-flex items-center gap-1"
                          disabled={busy}
                          onClick={() => void removeLine(line.id)}
                          aria-label={`Remove ${line.merchandise.product.title}`}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {error && (
              <p className="form-error text-center my-2" role="alert">
                {error}
              </p>
            )}

            {!!cart?.lines.nodes.length && (
              <footer className="drawer-footer">
                <div className="subtotal-row">
                  <span>Estimated Subtotal</span>
                  <strong>{formatMoney(cart.cost.subtotalAmount)}</strong>
                </div>
                <p className="text-xs text-slate-500 m-0 my-2">
                  Taxes and accurate shipping calculated securely at checkout.
                </p>

                <a
                  className="button button-dark checkout-button flex items-center justify-between"
                  href={cart.checkoutUrl}
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <div className="flex items-center gap-2">
                    <span>{formatMoney(cart.cost.subtotalAmount)}</span>
                    <ArrowRight size={16} />
                  </div>
                </a>

                <div className="drawer-secure-note">
                  <LockKeyhole size={13} className="text-emerald-700" />
                  <span>ENCRYPTED SHOPIFY CHECKOUT GUARANTEE</span>
                </div>

                <button
                  type="button"
                  className="text-link continue-link"
                  onClick={closeCart}
                >
                  Continue Shopping
                </button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
