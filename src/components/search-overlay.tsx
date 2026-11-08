"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Loader2, Search, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { searchProductsAction } from "@/actions/search";
import { formatMoney, imageUrl } from "@/lib/format";
import type { ShopifyProduct } from "@/lib/shopify/types";

export function SearchOverlay({
  open,
  onClose,
  shopifyConfigured,
}: {
  open: boolean;
  onClose: () => void;
  shopifyConfigured: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [resultsFor, setResultsFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Handle ESC key to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 200);

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
          <motion.div
            className="overlay-scrim"
            aria-label="Close search"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.section
            className="search-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Product search"
            initial={{ y: reduceMotion ? 0 : -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduceMotion ? 0 : -20, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="search-panel-head max-w-4xl mx-auto flex items-center justify-between pb-4 border-b border-slate-200">
              <Link className="wordmark" href="/" onClick={onClose}>
                <span className="wordmark-top text-base font-extrabold text-emerald-900 tracking-widest">
                  ALPINE ATELIER
                </span>
                <span className="wordmark-bottom text-[8px] text-slate-400">INSTANT DISCOVERY</span>
              </Link>
              <button
                className="icon-button"
                aria-label="Close search"
                onClick={onClose}
              >
                <X size={22} />
              </button>
            </div>

            <form
              action="/search"
              className="search-form"
              onSubmit={(e) => {
                if (!query.trim()) e.preventDefault();
              }}
            >
              <Search size={22} className="text-emerald-800 flex-shrink-0" />
              <input
                autoFocus
                type="search"
                name="q"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setError(null);
                }}
                placeholder="Search lederhosen, dirndl silk, linen shirts, accessories…"
                aria-label="Search collection"
              />
              {loading && <Loader2 size={18} className="animate-spin text-emerald-700 flex-shrink-0" />}
              {query && !loading && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  aria-label="Clear search input"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            <div className="search-suggestions">
              <span className="eyebrow">
                <i />
                {query.trim().length < 2
                  ? "POPULAR DISCOVERIES"
                  : loading
                  ? "SEARCHING ATELIER INVENTORY…"
                  : `FOUND ${visibleResults.length} PIECES`}
              </span>

              {error && <p className="form-error text-center mt-3">{error}</p>}

              {query.trim().length < 2 ? (
                <div className="suggestion-terms">
                  {["Lederhosen", "Dirndl", "Waistcoats", "Silk Aprons", "Haferlschuhe", "Accessories"].map(
                    (term) => (
                      <button
                        type="button"
                        key={term}
                        onClick={() => setQuery(term)}
                      >
                        <span>{term}</span>
                        <ArrowRight size={13} />
                      </button>
                    ),
                  )}
                </div>
              ) : !shopifyConfigured ? (
                <p className="text-slate-500 text-sm mt-3">
                  Catalog discovery will activate once the Shopify store credentials are connected.
                </p>
              ) : visibleResults.length > 0 ? (
                <div className="search-results">
                  {visibleResults.map((product) => (
                    <Link
                      key={product.id}
                      className="search-result"
                      href={`/products/${product.handle}`}
                      onClick={onClose}
                    >
                      {product.featuredImage ? (
                        <Image
                          src={imageUrl(product.featuredImage.url, 200)}
                          alt={product.featuredImage.altText ?? product.title}
                          width={56}
                          height={64}
                        />
                      ) : (
                        <div className="w-14 h-16 bg-slate-100 rounded flex items-center justify-center text-slate-300">
                          <Sparkles size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="block truncate">{product.title}</span>
                        <span className="text-[11px] text-slate-400 block">{product.productType || "Garment"}</span>
                      </div>
                      <strong>{formatMoney(product.priceRange.minVariantPrice)}</strong>
                    </Link>
                  ))}
                </div>
              ) : (
                !loading &&
                !error &&
                resultsFor === query && (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm m-0">
                      No pieces found for &ldquo;{query}&rdquo;. Try another term or explore our main categories.
                    </p>
                  </div>
                )
              )}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
