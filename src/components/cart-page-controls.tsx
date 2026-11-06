"use client";

import { useState, useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { updateCartAction } from "@/actions/cart";

export function CartPageControls({ lineId, quantity }: { lineId: string; quantity: number }) {
  const [count, setCount] = useState(quantity);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function update(value: number) {
    setCount(value);
    setError("");
    startTransition(async () => {
      try {
        const cart = await updateCartAction([{ id: lineId, quantity: value }]);
        window.dispatchEvent(new CustomEvent("wiesn:cart-updated", { detail: cart }));
      } catch (reason) {
        setCount(quantity);
        setError(reason instanceof Error ? reason.message : "The cart could not be updated.");
      }
    });
  }
  return (
    <div className="control-wrap">
      <div className="cart-control"><button type="button" disabled={pending || count <= 1} aria-label="Decrease quantity" onClick={() => update(Math.max(0, count - 1))}><Minus size={13} /></button><span aria-live="polite">{count}</span><button type="button" disabled={pending} aria-label="Increase quantity" onClick={() => update(count + 1)}><Plus size={13} /></button></div>
      <button className="remove" type="button" disabled={pending} onClick={() => update(0)}><Trash2 size={13} /> Remove</button>
      {error && <span className="error" role="alert">{error}</span>}
      <style>{`
        .control-wrap { display:grid; justify-items:end; gap:.45rem; }.cart-control { display:flex; height:32px; align-items:center; gap:.45rem; border:1px solid var(--line); border-radius:20px; padding:0 .35rem; }
        button { display:grid; width:27px; height:28px; place-items:center; border:0; background:transparent; cursor:pointer; }button:disabled { opacity:.4; cursor:not-allowed; }.cart-control span { min-width:14px; text-align:center; font-size:.7rem; }
        .remove { display:flex; width:auto; height:24px; align-items:center; gap:.35rem; color:var(--muted); font-size:.63rem; }.error { max-width:130px; color:var(--berry); font-size:.6rem; }
      `}</style>
    </div>
  );
}
