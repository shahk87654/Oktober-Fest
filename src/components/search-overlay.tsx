"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { searchProductsAction } from "@/actions/search";
import { formatMoney, imageUrl } from "@/lib/format";
import type { ShopifyProduct } from "@/lib/shopify/types";

export function SearchOverlay({ open, onClose, shopifyConfigured }: { open: boolean; onClose: () => void; shopifyConfigured: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [resultsFor, setResultsFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || !shopifyConfigured || query.trim().length < 2) {
      return;
    }
    let active = true;
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      searchProductsAction(query)
        .then((products) => {
          if (active) {
            setResults(products);
            setResultsFor(query);
          }
        })
        .catch((cause: unknown) => {
          if (active) {
            setResults([]);
            setResultsFor(query);
            setError(cause instanceof Error ? cause.message : "Search is unavailable.");
          }
        })
        .finally(() => { if (active) setLoading(false); });
    }, 220);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [query, open, shopifyConfigured]);
  const visibleResults = resultsFor === query ? results : [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button className="overlay-scrim" aria-label="Close search" onClick={onClose} initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: reduceMotion ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }} />
          <motion.section className="search-panel" role="dialog" aria-modal="true" aria-label="Product search" initial={{ y: reduceMotion ? 0 : -24, opacity: reduceMotion ? 1 : 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: reduceMotion ? 0 : -24, opacity: reduceMotion ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>
            <div className="search-panel-head">
              <Link className="wordmark" href="/" onClick={onClose}><span className="wordmark-top">ALPINE</span><span className="wordmark-bottom">ATELIER</span></Link>
              <button className="icon-button" aria-label="Close search" onClick={onClose}><X size={21} /></button>
            </div>
            <form action="/search" className="search-form">
              <Search size={21} />
              <input autoFocus type="search" name="q" value={query} onChange={(event) => { setQuery(event.target.value); setError(null); }} placeholder="What are you looking for?" aria-label="Search products" />
              <button className="text-link" type="submit">SEARCH <ArrowRight size={15} /></button>
            </form>
            <div className="search-suggestions">
              <span className="eyebrow">{query.trim().length < 2 ? "A FEW PLACES TO BEGIN" : loading ? "SEARCHING THE COLLECTION" : "SUGGESTED PIECES"}</span>
              {error && <p className="form-error">{error}</p>}
              {query.trim().length < 2 ? (
                <div className="suggestion-terms">{["Lederhosen", "Dirndl", "Shirts", "Accessories"].map((term) => <button key={term} onClick={() => setQuery(term)}>{term}<ArrowRight size={14} /></button>)}</div>
              ) : !shopifyConfigured ? (
                <p className="muted">Search becomes available when the live Shopify catalog is connected.</p>
              ) : visibleResults.length ? (
                <div className="search-results">{visibleResults.map((product) => (
                  <Link key={product.id} className="search-result" href={`/products/${product.handle}`} onClick={onClose}>
                    {product.featuredImage && <Image src={imageUrl(product.featuredImage.url, 200)} alt={product.featuredImage.altText ?? product.title} width={64} height={78} />}
                    <span>{product.title}</span><strong>{formatMoney(product.priceRange.minVariantPrice)}</strong><ArrowRight size={14} />
                  </Link>
                ))}</div>
              ) : !loading && !error && resultsFor === query && <p className="muted">No pieces found. Try another search.</p>}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
