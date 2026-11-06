import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { fetchCart } from "@/lib/shopify/cart";
import { formatMoney } from "@/lib/format";
import { shopifyConfigured } from "@/lib/env";
import { CartPageControls } from "@/components/cart-page-controls";
import { getStorePolicy } from "@/lib/policy";
import { CheckoutLink } from "@/components/checkout-link";

export const metadata: Metadata = { title: "Your bag", robots: { index: false, follow: false } };

export default async function CartPage() {
  const cart = shopifyConfigured ? await fetchCart() : null;
  const policy = await getStorePolicy();
  return (
    <section className="page-shell cart-page">
      <p className="eyebrow">The Wiesn edit</p><h1 className="display">Your bag <span>{cart?.totalQuantity ?? 0}</span></h1>
      {!cart || cart.lines.nodes.length === 0 ? (
        <div className="cart-empty lozenge"><ShoppingBag size={36} strokeWidth={1.2} /><h2 className="display">Nothing in your bag just yet.</h2><p>Good things are worth taking a look at.</p><Link className="button-primary" href="/collections/lederhosen-men">Explore the collection <ArrowRight size={16} /></Link></div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {cart.lines.nodes.map((line) => (
              <article className="cart-line" key={line.id}>
                <Link className="cart-image" href={`/products/${line.merchandise.product.handle}`}>
                  {line.merchandise.product.featuredImage && <Image src={line.merchandise.product.featuredImage.url} alt={line.merchandise.product.featuredImage.altText ?? line.merchandise.product.title} fill sizes="120px" />}
                </Link>
                <div className="cart-description"><Link href={`/products/${line.merchandise.product.handle}`} className="display">{line.merchandise.product.title}</Link><p>{line.merchandise.selectedOptions.map((option) => option.value).join(" · ")}</p>{line.attributes.filter(({ key }) => !key.startsWith("_")).map(({ key, value }) => <p key={key}>{key}: {value}</p>)}</div>
                <div className="cart-amount"><strong>{formatMoney(line.cost.totalAmount)}</strong><CartPageControls lineId={line.id} quantity={line.quantity} /></div>
              </article>
            ))}
          </div>
          <aside className="cart-summary"><h2 className="display">A little sum-up.</h2><div><span>Subtotal</span><strong>{formatMoney(cart.cost.subtotalAmount)}</strong></div><p>Taxes and shipping are calculated at checkout. {policy.shippingThresholds[cart.cost.subtotalAmount.currencyCode] ? `Free shipping over ${formatMoney({ amount: String(policy.shippingThresholds[cart.cost.subtotalAmount.currencyCode]), currencyCode: cart.cost.subtotalAmount.currencyCode })}.` : policy.shippingCopy}</p><CheckoutLink className="button-primary checkout" cart={cart}>Continue to checkout <ArrowRight size={16} /></CheckoutLink><Link href="/collections/all">Keep browsing</Link></aside>
        </div>
      )}
      <style>{`
        .cart-page { min-height:55vh; padding-block:4rem 6rem; }.cart-page h1 { margin:.5rem 0 2.5rem; font-size:clamp(3rem,6vw,5.5rem); }.cart-page h1 span { font:600 1rem var(--font-ui); color:var(--muted); }
        .cart-empty { display:flex; min-height:350px; align-items:center; justify-content:center; flex-direction:column; gap:.8rem; border-radius:14px; text-align:center; }.cart-empty h2 { margin:0; font-size:2rem; }.cart-empty p { color:var(--muted); font-size:.8rem; }
        .cart-layout { display:grid; grid-template-columns:1.6fr .7fr; gap:4rem; }.cart-line { display:grid; grid-template-columns:110px 1fr auto; gap:1rem; border-bottom:1px dashed var(--line); padding:1rem 0; }
        .cart-image { position:relative; aspect-ratio:4/5; overflow:hidden; border-radius:8px; background:#e9e3d6; }.cart-image img { object-fit:cover; }.cart-description>a { font-size:1.15rem; }.cart-description p { margin:.45rem 0; color:var(--muted); font-size:.7rem; }.cart-amount { display:flex; align-items:flex-end; flex-direction:column; gap:1rem; font-size:.78rem; }
        .cart-summary { position:sticky; top:120px; align-self:start; border:1px dashed var(--pretzel); border-radius:12px; padding:1.4rem; }.cart-summary h2 { margin:0 0 1.3rem; font-size:1.65rem; }.cart-summary>div { display:flex; justify-content:space-between; border-top:1px solid var(--line); padding-top:1rem; font-size:.8rem; }.cart-summary p { color:var(--muted); font-size:.68rem; line-height:1.5; }.cart-summary .checkout { width:100%; margin:1rem 0; }.cart-summary>a:last-child { display:block; text-align:center; font-size:.72rem; text-decoration:underline; text-decoration-color:var(--gold); text-underline-offset:4px; }
        @media(max-width:800px) { .cart-layout { grid-template-columns:1fr; gap:2rem; }.cart-summary { position:static; }.cart-line { grid-template-columns:80px 1fr auto; gap:.7rem; } }
      `}</style>
    </section>
  );
}
