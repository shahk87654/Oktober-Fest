"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ShopifyImage } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/format";

type RecentlyViewedItem = {
  handle: string;
  title: string;
  image: ShopifyImage | null;
  amount: string;
  currencyCode: string;
};

function isRecentlyViewedItem(value: unknown): value is RecentlyViewedItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RecentlyViewedItem>;
  return typeof item.handle === "string" && typeof item.title === "string" &&
    typeof item.amount === "string" && typeof item.currencyCode === "string" &&
    (item.image === null || (typeof item.image === "object" && typeof item.image.url === "string" && typeof item.image.width === "number" && typeof item.image.height === "number"));
}

export function RecentlyViewed({ item }: { item: RecentlyViewedItem }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  useEffect(() => {
    let previous: RecentlyViewedItem[] = [];
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("wiesn-recently-viewed") ?? "[]");
      if (Array.isArray(saved)) previous = saved.filter(isRecentlyViewedItem);
    } catch (error) {
      if (error instanceof SyntaxError) {
        localStorage.removeItem("wiesn-recently-viewed");
        console.error("Discarded invalid recently viewed items from local storage.");
      } else {
        throw error;
      }
    }
    const updated = [item, ...previous.filter((entry) => entry.handle !== item.handle)].slice(0, 7);
    localStorage.setItem("wiesn-recently-viewed", JSON.stringify(updated));
    const timer = window.setTimeout(() => {
      setItems(previous.filter((entry) => entry.handle !== item.handle).slice(0, 6));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [item]);

  if (!items.length) return null;
  return (
    <section className="page-shell recently-viewed">
      <p className="eyebrow">Good to see you again</p><h2 className="display">Recently viewed.</h2>
      <div className="recent-rail">{items.map((entry) => <Link className="recent-card" href={`/products/${entry.handle}`} key={entry.handle}>
        <div>{entry.image && <Image src={entry.image.url} alt={entry.image.altText ?? entry.title} fill sizes="160px" />}</div>
        <strong>{entry.title}</strong><span>{formatMoney({ amount: entry.amount, currencyCode: entry.currencyCode })}</span>
      </Link>)}</div>
      <style>{`
        .recently-viewed { padding-block:2rem 5rem; }.recently-viewed h2 { margin:.4rem 0 1.3rem; font-size:2rem; }
        .recent-rail { display:grid; grid-auto-columns:minmax(145px,1fr); grid-auto-flow:column; gap:.8rem; overflow:auto; scroll-snap-type:x mandatory; }
        .recent-card { display:grid; gap:.45rem; min-width:0; scroll-snap-align:start; }.recent-card>div { position:relative; overflow:hidden; aspect-ratio:4/5; border-radius:9px; background:#e9e3d6; }.recent-card img { object-fit:cover; }
        .recent-card strong { overflow:hidden; font-family:var(--font-display); font-size:.78rem; text-overflow:ellipsis; white-space:nowrap; }.recent-card>span { font-size:.66rem; }
      `}</style>
    </section>
  );
}
