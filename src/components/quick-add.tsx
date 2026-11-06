"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { addToCartAction } from "@/actions/cart";
import type { ProductVariant } from "@/lib/shopify/types";

export function QuickAdd({ variants, productTitle }: { variants: ProductVariant[]; productTitle: string }) {
  const available = variants.filter((variant) => variant.availableForSale);
  const [variantId, setVariantId] = useState(available[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function add() {
    if (!variantId) return;
    setError("");
    startTransition(async () => {
      try {
        const cart = await addToCartAction([{ merchandiseId: variantId, quantity: 1 }]);
        window.dispatchEvent(new CustomEvent("wiesn:open-cart", { detail: cart }));
        window.dispatchEvent(new CustomEvent("wiesn:cart-updated", { detail: cart }));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "The item could not be added.");
      }
    });
  }

  if (!available.length) return <button className="quick-add quick-add--sold" type="button" disabled>Sold out</button>;
  return (
    <div className="quick-add-wrap">
      {available.length > 1 && (
        <label className="sr-only" htmlFor={`quick-size-${variants[0]?.id}`}>Choose a size for {productTitle}</label>
      )}
      {available.length > 1 && (
        <select id={`quick-size-${variants[0]?.id}`} aria-label={`Choose a variant for ${productTitle}`} value={variantId} onChange={(event) => setVariantId(event.target.value)}>
          {available.map((variant) => <option value={variant.id} key={variant.id}>{variant.selectedOptions.map((option) => option.value).join(" / ")}</option>)}
        </select>
      )}
      <button className="quick-add" type="button" disabled={pending || !variantId} onClick={add}>
        <Plus size={14} />{pending ? "Adding…" : "Quick add"}
      </button>
      {error && <span className="quick-add-error" role="alert">{error}</span>}
      <style>{`
        .quick-add-wrap { display:flex; gap:.45rem; align-items:center; }
        select { max-width:110px; height:38px; border:1px solid var(--line); border-radius:20px; background:var(--cream); padding-inline:.65rem; font-size:.67rem; }
        .quick-add { display:inline-flex; min-height:38px; flex:1; align-items:center; justify-content:center; gap:.35rem; border:1px solid var(--hops); border-radius:22px; background:var(--hops); color:white; font-size:.65rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; cursor:pointer; }
        .quick-add:hover:not(:disabled) { background:var(--forest); }
        .quick-add:disabled { cursor:not-allowed; opacity:.55; }
        .quick-add--sold { width:100%; }
        .quick-add-error { color:var(--berry); font-size:.65rem; }
      `}</style>
    </div>
  );
}
