"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { updateCartAction } from "@/actions/cart";
import { formatMoney } from "@/lib/format";
import type { Cart } from "@/lib/shopify/types";
import { CheckoutLink } from "@/components/checkout-link";

export function CartDrawer({ thresholds }: { thresholds: Record<string, number | null> }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const show = (event: Event) => {
      const nextCart = (event as CustomEvent<Cart>).detail;
      if (nextCart) {
        setCart(nextCart);
        setOpen(true);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab" && drawerRef.current) {
        const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>("a[href],button:not(:disabled),input,select,[tabindex]:not([tabindex='-1'])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("wiesn:open-cart", show);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("wiesn:open-cart", show);
      window.removeEventListener("keydown", escape);
    };
  }, []);

  function changeQuantity(lineId: string, quantity: number) {
    if (!cart) return;
    setError("");
    startTransition(async () => {
      try {
        const updated = await updateCartAction([{ id: lineId, quantity }]);
        setCart(updated);
        window.dispatchEvent(new CustomEvent("wiesn:cart-updated", { detail: updated }));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "The cart could not be updated.");
      }
    });
  }

  const currency = cart?.cost.subtotalAmount.currencyCode ?? "USD";
  const threshold = thresholds[currency] ?? null;
  const progress = cart && threshold
    ? Math.min(Number(cart.cost.subtotalAmount.amount) / threshold * 100, 100)
    : 0;
  const remaining = cart && threshold
    ? Math.max(threshold - Number(cart.cost.subtotalAmount.amount), 0)
    : null;

  return (
    <>
      {open && <button className="cart-scrim" type="button" aria-label="Close cart" onClick={() => setOpen(false)} />}
      <aside ref={drawerRef} inert={!open} className={`cart-drawer${open ? " cart-drawer--open" : ""}`} role="dialog" aria-modal="true" aria-label="Your shopping bag" aria-hidden={!open}>
        <div className="drawer-header">
          <div><p className="eyebrow">Your Wiesn edit</p><h2 className="display">The good stuff <span>({cart?.totalQuantity ?? 0})</span></h2></div>
          <button type="button" className="drawer-close" aria-label="Close cart" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        {cart ? (
          <>
            <div className="shipping-card">
              <p>{remaining === null ? "Shipping options for your destination are confirmed at checkout." : remaining > 0 ? `You're ${formatMoney({ amount: remaining.toFixed(2), currencyCode: currency })} away from free shipping.` : "You unlocked free shipping. Prost!"}</p>
              <div className="shipping-progress"><span style={{ width: `${progress}%` }} /></div>
              <div className="stein" aria-hidden="true"><span style={{ height: `${progress}%` }} />🍺</div>
            </div>
            <div className="drawer-lines">
              {cart.lines.nodes.map((line) => (
                <article className="drawer-line" key={line.id}>
                  <Link href={`/products/${line.merchandise.product.handle}`} onClick={() => setOpen(false)} className="drawer-image">
                    {line.merchandise.product.featuredImage && <Image src={line.merchandise.product.featuredImage.url} alt={line.merchandise.product.featuredImage.altText ?? line.merchandise.product.title} fill sizes="100px" />}
                  </Link>
                  <div className="drawer-line__body">
                    <Link href={`/products/${line.merchandise.product.handle}`} onClick={() => setOpen(false)} className="drawer-line__title">{line.merchandise.product.title}</Link>
                    <p>{line.merchandise.selectedOptions.map(({ value }) => value).join(" · ")}</p>
                    {line.attributes.filter(({ key }) => !key.startsWith("_")).map(({ key, value }) => <p key={key}>{key}: {value}</p>)}
                    <div className="quantity">
                      <button type="button" aria-label={`Decrease ${line.merchandise.product.title} quantity`} disabled={pending} onClick={() => changeQuantity(line.id, line.quantity - 1)}><Minus size={13} /></button>
                      <span aria-live="polite">{line.quantity}</span>
                      <button type="button" aria-label={`Increase ${line.merchandise.product.title} quantity`} disabled={pending} onClick={() => changeQuantity(line.id, line.quantity + 1)}><Plus size={13} /></button>
                    </div>
                  </div>
                  <strong>{formatMoney(line.cost.totalAmount)}</strong>
                </article>
              ))}
            </div>
            {error && <p className="drawer-error" role="alert">{error}</p>}
            <div className="drawer-total"><span>Subtotal</span><strong>{formatMoney(cart.cost.subtotalAmount)}</strong></div>
            <p className="drawer-note">Taxes and shipping calculated at checkout.</p>
            <CheckoutLink className="checkout-button" cart={cart}>Continue to checkout <ArrowRight size={17} /></CheckoutLink>
            <Link href="/cart" className="view-cart" onClick={() => setOpen(false)}>View bag</Link>
          </>
        ) : (
          <div className="empty-bag"><ShoppingBag size={36} strokeWidth={1} /><p>Your bag is taking a little breather.</p><Link className="button-primary" href="/collections/lederhosen-men" onClick={() => setOpen(false)}>Explore the collection</Link></div>
        )}
      </aside>
      <style>{`
        .cart-scrim { position:fixed; z-index:70; inset:0; border:0; background:rgba(20,33,26,.42); }
        .cart-drawer { position:fixed; z-index:71; top:0; right:0; bottom:0; display:flex; width:min(480px,100%); flex-direction:column; padding:1.6rem; background:var(--cream); box-shadow:-10px 0 40px rgba(20,33,26,.15); transform:translateX(105%); transition:transform .28s ease; }
        .cart-drawer--open { transform:translateX(0); }
        .drawer-header { display:flex; align-items:start; justify-content:space-between; padding-bottom:1.1rem; border-bottom:1px dashed rgba(122,74,37,.45); }
        .drawer-header p { margin:0; color:var(--pretzel); }
        .drawer-header h2 { margin:.3rem 0 0; font-size:2rem; }
        .drawer-header h2 span { font-family:var(--font-ui); font-size:.85rem; }
        .drawer-close { display:grid; width:42px; height:42px; place-items:center; border:1px solid var(--line); border-radius:50%; background:transparent; cursor:pointer; }
        .shipping-card { position:relative; margin:1.1rem 0; padding:1rem 3.8rem 1rem 1rem; border-radius:12px; background:#ece8dc; }
        .shipping-card p { margin:0 0 .6rem; font-size:.73rem; }
        .shipping-progress { height:5px; overflow:hidden; border-radius:10px; background:rgba(20,33,26,.12); }
        .shipping-progress span { display:block; height:100%; border-radius:10px; background:var(--hops); transition:width .3s; }
        .stein { position:absolute; right:1rem; bottom:.8rem; display:grid; width:36px; height:44px; place-items:end center; overflow:hidden; border:2px solid var(--pretzel); border-radius:3px 3px 8px 8px; font-size:1.35rem; }
        .stein span { position:absolute; inset:auto 0 0; background:rgba(224,165,38,.68); }
        .drawer-lines { flex:1; overflow:auto; }
        .drawer-line { display:grid; grid-template-columns:74px 1fr auto; gap:.9rem; align-items:start; padding:1rem 0; border-bottom:1px solid var(--line); }
        .drawer-image { position:relative; width:74px; aspect-ratio:4/5; overflow:hidden; border-radius:8px; background:#e9e3d6; }
        .drawer-line__body { min-width:0; }
        .drawer-line__title { font-family:var(--font-display); font-size:1rem; }
        .drawer-line p { margin:.25rem 0; color:var(--muted); font-size:.68rem; }
        .drawer-line strong { font-size:.75rem; }
        .quantity { display:flex; width:max-content; height:31px; align-items:center; gap:.7rem; margin-top:.6rem; border:1px solid var(--line); border-radius:20px; padding:0 .45rem; }
        .quantity button { display:grid; width:24px; height:26px; place-items:center; border:0; background:transparent; cursor:pointer; }
        .quantity span { font-size:.72rem; }
        .drawer-total { display:flex; justify-content:space-between; border-top:1px dashed rgba(122,74,37,.45); padding-top:1rem; font-size:.9rem; }
        .drawer-note { margin:.45rem 0 1rem; color:var(--muted); font-size:.68rem; }
        .checkout-button { display:flex; min-height:50px; align-items:center; justify-content:center; gap:.7rem; border-radius:999px; background:var(--hops); color:white; font-size:.75rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
        .view-cart { display:block; margin:1rem auto 0; font-size:.75rem; text-decoration:underline; text-decoration-color:var(--gold); text-underline-offset:4px; }
        .empty-bag { display:flex; flex:1; align-items:center; justify-content:center; flex-direction:column; gap:1rem; text-align:center; }
        .empty-bag p { font-family:var(--font-display); font-size:1.35rem; }
        .drawer-error { color:var(--berry); font-size:.76rem; }
        @media(prefers-reduced-motion:reduce) { .cart-drawer { transition:none; } }
      `}</style>
    </>
  );
}
