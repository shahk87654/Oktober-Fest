"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  LockKeyhole,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { formatMoney, imageUrl } from "@/lib/format";
import { useCart } from "./cart-provider";

const FREE_SHIPPING_THRESHOLD = 150;

export function CartPage() {
  const { cart, ready, busy, error, changeLine, removeLine } = useCart();

  if (!ready) {
    return (
      <main className="cart-page flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="eyebrow">
          <i /> SHOPPING BAG
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold mt-3 mb-2">
          Retrieving your <em>pieces…</em>
        </h1>
        <p className="text-slate-500 text-sm">Connecting with the live Shopify atelier…</p>
      </main>
    );
  }

  if (!cart || cart.lines.nodes.length === 0) {
    return (
      <main className="cart-page flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <ShoppingBag size={36} />
        </div>
        <span className="eyebrow">
          <i /> YOUR BAG
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium mt-3 mb-3 text-slate-900">
          Your shopping bag is <em>empty.</em>
        </h1>
        <p className="text-slate-500 text-base max-w-md mb-6">
          {error || "Explore our handcrafted Oktoberfest collection to add authentic Bavarian garments to your wardrobe."}
        </p>
        <Link className="button button-dark" href="/collections">
          <span>EXPLORE THE COLLECTIONS</span>
          <ArrowRight size={15} />
        </Link>
      </main>
    );
  }

  const subtotalNumber = Number(cart.cost.subtotalAmount.amount ?? 0);
  const progressPercent = Math.min(100, Math.round((subtotalNumber / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalNumber);

  return (
    <main className="cart-page cart-page-filled">
      <div className="cart-breadcrumb">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">Shopping Bag</span>
      </div>

      <div className="cart-page-title">
        <div>
          <span className="eyebrow">
            <i /> {cart.totalQuantity} {cart.totalQuantity === 1 ? "PIECE SELECTED" : "PIECES SELECTED"}
          </span>
          <h1>
            Your Shopping <em>Bag.</em>
          </h1>
        </div>
        <Link className="text-link" href="/collections">
          <span>CONTINUE BROWSING</span>
          <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Free Shipping Meter Banner */}
      <div className="my-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <Truck size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-950 m-0">
              {remainingForFreeShipping === 0 ? (
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 size={16} /> Free Express Courier Shipping Unlocked!
                </span>
              ) : (
                <span>
                  Add <strong className="text-emerald-900">${remainingForFreeShipping.toFixed(2)}</strong> more to qualify for Free Worldwide Express Shipping
                </span>
              )}
            </p>
            <p className="text-xs text-emerald-700/80 m-0">Fast tracked delivery directly from Munich</p>
          </div>
        </div>
        <div className="w-full sm:w-48 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-emerald-200 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-emerald-900">{progressPercent}%</span>
        </div>
      </div>

      <div className="cart-page-layout">
        <div className="cart-page-items">
          <div className="cart-items-heading">
            <span>SELECTED PIECES</span>
            <span>
              {cart.totalQuantity} {cart.totalQuantity === 1 ? "ITEM" : "ITEMS"}
            </span>
          </div>

          {cart.lines.nodes.map((line) => {
            const image = line.merchandise.image ?? line.merchandise.product.featuredImage;
            return (
              <article className="cart-page-line" key={line.id}>
                <Link
                  href={`/products/${line.merchandise.product.handle}`}
                  className="cart-page-image"
                  aria-label={`View ${line.merchandise.product.title}`}
                >
                  {image ? (
                    <Image
                      src={imageUrl(image.url, 360)}
                      alt={image.altText ?? line.merchandise.product.title}
                      width={120}
                      height={150}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <Sparkles size={24} />
                    </div>
                  )}
                </Link>

                <div className="cart-page-line-copy">
                  <span className="eyebrow text-[10px]">
                    {line.merchandise.product.vendor || "ALPINE ATELIER"}
                  </span>
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    className="cart-page-product-title hover:text-emerald-800 transition-colors"
                  >
                    {line.merchandise.product.title}
                  </Link>
                  <p className="text-xs text-slate-500 font-medium m-0 mb-3">
                    {line.merchandise.title !== "Default Title" ? line.merchandise.title : "Standard Size"}
                    {line.merchandise.sku ? ` • SKU: ${line.merchandise.sku}` : ""}
                  </p>

                  <div className="cart-page-line-bottom">
                    <div
                      className="quantity-control"
                      aria-label={`Quantity for ${line.merchandise.product.title}`}
                    >
                      <button
                        type="button"
                        aria-label={`Decrease ${line.merchandise.product.title} quantity`}
                        disabled={busy}
                        onClick={() => void changeLine(line.id, line.quantity - 1)}
                      >
                        <Minus size={13} />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${line.merchandise.product.title} quantity`}
                        disabled={busy}
                        onClick={() => void changeLine(line.id, line.quantity + 1)}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-link inline-flex items-center gap-1.5 text-xs font-semibold"
                      disabled={busy}
                      onClick={() => void removeLine(line.id)}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                <strong className="cart-page-price">
                  {formatMoney(line.cost.totalAmount)}
                </strong>
              </article>
            );
          })}

          {error && (
            <p role="alert" className="form-error mt-4">
              {error}
            </p>
          )}
        </div>

        <aside className="cart-summary">
          <div className="cart-summary-heading">
            <span>ORDER SUMMARY</span>
            <span className="text-emerald-700 font-bold">SHOPIFY SECURE</span>
          </div>

          <div className="subtotal-row">
            <span>Subtotal</span>
            <strong>{formatMoney(cart.cost.subtotalAmount)}</strong>
          </div>

          <div className="flex justify-between text-xs text-slate-500 my-2">
            <span>Estimated Shipping</span>
            <span className="font-semibold text-emerald-700">
              {remainingForFreeShipping === 0 ? "FREE" : "Calculated at checkout"}
            </span>
          </div>

          <p className="text-xs text-slate-500 m-0 my-3">
            Applicable customs, duties, and local taxes will be computed securely during checkout.
          </p>

          <a
            className="button button-dark w-full flex items-center justify-between"
            href={cart.checkoutUrl}
          >
            <span>PROCEED TO CHECKOUT</span>
            <ArrowRight size={16} />
          </a>

          <div className="cart-summary-note">
            <LockKeyhole size={14} className="text-emerald-700" />
            <span>256-BIT ENCRYPTED SHOPIFY PAYMENT</span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>30-Day Guarantee</span>
            </span>
            <Link href="/pages/contact" className="text-emerald-800 font-bold hover:underline">
              Need assistance?
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
