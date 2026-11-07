"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { formatMoney, imageUrl } from "@/lib/format";
import { useCart } from "./cart-provider";

export function CartPage() {
  const { cart, ready, busy, error, changeLine, removeLine } = useCart();

  if (!ready) {
    return <main className="cart-page"><span className="eyebrow">YOUR EDIT</span><h1>Your bag is <em>arriving.</em></h1><p className="muted">Retrieving your Shopify cart…</p></main>;
  }
  if (!cart) {
    return <main className="cart-page"><span className="eyebrow">YOUR EDIT</span><h1>Your bag is <em>empty.</em></h1><p className="muted">{error || "The pieces you choose will find their way here."}</p><Link className="button button-dark" href="/collections">EXPLORE THE COLLECTIONS <ArrowRight size={15} /></Link></main>;
  }

  return (
    <main className="cart-page cart-page-filled">
      <div className="cart-page-title"><div><span className="eyebrow">YOUR EDIT / {cart.totalQuantity} PIECES</span><h1>Your <em>bag.</em></h1></div><Link className="text-link" href="/collections">CONTINUE EXPLORING <ArrowRight size={15} /></Link></div>
      <div className="cart-page-layout">
        <div className="cart-page-items">
          {cart.lines.nodes.map((line) => <article className="cart-page-line" key={line.id}>
            <Link href={`/products/${line.merchandise.product.handle}`} className="cart-page-image">
              {(line.merchandise.image ?? line.merchandise.product.featuredImage) && <Image src={imageUrl((line.merchandise.image ?? line.merchandise.product.featuredImage)!.url, 360)} alt={line.merchandise.product.title} width={175} height={220} />}
            </Link>
            <div className="cart-page-line-copy">
              <span className="eyebrow">{line.merchandise.product.vendor || "ALPINE ATELIER"}</span>
              <Link href={`/products/${line.merchandise.product.handle}`} className="cart-page-product-title">{line.merchandise.product.title}</Link>
              <p>{line.merchandise.title !== "Default Title" ? line.merchandise.title : "One size"}{line.merchandise.sku ? ` · ${line.merchandise.sku}` : ""}</p>
              <div className="cart-page-line-bottom">
                <div className="quantity-control"><button aria-label="Decrease quantity" disabled={busy} onClick={() => void changeLine(line.id, line.quantity - 1)}><Minus size={13} /></button><span>{line.quantity}</span><button aria-label="Increase quantity" disabled={busy} onClick={() => void changeLine(line.id, line.quantity + 1)}><Plus size={13} /></button></div>
                <button className="remove-link" disabled={busy} onClick={() => void removeLine(line.id)}><Trash2 size={13} /> REMOVE</button>
              </div>
            </div>
            <strong className="cart-page-price">{formatMoney(line.cost.totalAmount)}</strong>
          </article>)}
          {error && <p role="alert" className="form-error">{error}</p>}
        </div>
        <aside className="cart-summary">
          <span className="eyebrow">YOUR ORDER</span>
          <div className="subtotal-row"><span>Subtotal</span><strong>{formatMoney(cart.cost.subtotalAmount)}</strong></div>
          <p>Shipping and any applicable taxes are calculated at checkout.</p>
          <a className="button button-dark" href={cart.checkoutUrl}>PROCEED TO CHECKOUT <ArrowRight size={16} /></a>
          <div className="cart-summary-note"><span>SECURE CHECKOUT</span><span>FULFILLED BY SHOPIFY</span></div>
        </aside>
      </div>
    </main>
  );
}
