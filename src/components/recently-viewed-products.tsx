"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { getRecentlyViewedProducts } from "@/actions/recently-viewed";
import { ProductCard } from "./product-card";

const STORAGE_KEY = "alpine-recently-viewed";

export function RecentlyViewedProducts({ currentHandle }: { currentHandle: string }) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);

  useEffect(() => {
    let active = true;
    let handles: string[] = [];

    try {
      const saved: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) {
        handles = saved
          .filter((handle): handle is string => typeof handle === "string" && handle !== currentHandle)
          .slice(0, 4);
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([currentHandle, ...handles].slice(0, 5)));
    } catch (error) {
      console.error("Unable to read or update recently viewed products.", error);
    }

    if (handles.length > 0) {
      getRecentlyViewedProducts(handles)
        .then((result) => {
          if (active) setProducts(result);
        })
        .catch((error: unknown) => {
          console.error("Unable to load recently viewed products from Shopify.", error);
        });
    }

    return () => {
      active = false;
    };
  }, [currentHandle]);

  if (products.length === 0) return null;

  return (
    <section className="section recently-viewed" aria-labelledby="recently-viewed-title">
      <header className="recently-viewed-heading">
        <div>
          <span className="eyebrow">
            <Clock3 size={13} /> RECENTLY EXPLORED
          </span>
          <h2 id="recently-viewed-title">
            Still on <em>your mind?</em>
          </h2>
        </div>
        <Link href="/collections" className="text-link">
          <span>ALL PIECES</span>
          <ArrowRight size={14} />
        </Link>
      </header>
      <div className="product-grid">
        {products.map((product) => (
          <div className="recently-viewed-card" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
