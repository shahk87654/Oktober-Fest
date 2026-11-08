"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Heart, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { formatMoney, imageUrl } from "@/lib/format";
import { useCart } from "./cart-provider";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const { addLine, busy } = useCart();
  const [added, setAdded] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const image = product.featuredImage ?? product.images.nodes[0];
  const secondImage = product.images.nodes.find((item) => item.url !== image?.url);
  const availableVariant = product.variants.nodes.find((variant) => variant.availableForSale);
  const minPrice = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const onSale = compareAt && Number(compareAt.amount) > Number(minPrice.amount);

  const discountPercent = onSale
    ? Math.round(((Number(compareAt.amount) - Number(minPrice.amount)) / Number(compareAt.amount)) * 100)
    : 0;

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!availableVariant || busy) return;

    const ok = await addLine(availableVariant.id, 1);
    if (ok) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    }
  }

  function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavorited((prev) => !prev);
  }

  return (
    <article className="product-card group">
      <div className="product-image-wrap">
        <Link
          href={`/products/${product.handle}`}
          className="block w-full h-full relative"
          aria-label={`View ${product.title}`}
        >
          {image ? (
            <>
              <Image
                className="product-image"
                src={imageUrl(image.url, 700)}
                alt={image.altText ?? product.title}
                width={700}
                height={900}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {secondImage && (
                <Image
                  className="product-image product-image-hover"
                  src={imageUrl(secondImage.url, 700)}
                  alt={secondImage.altText ?? `${product.title}, alternate view`}
                  width={700}
                  height={900}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
              <Sparkles size={24} />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {onSale && (
            <span className="product-badge">
              SAVE {discountPercent > 0 ? `${discountPercent}%` : "SALE"}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            favorited
              ? "bg-rose-50 text-rose-500 scale-105"
              : "bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:text-slate-900 shadow-sm"
          }`}
        >
          <Heart size={14} fill={favorited ? "currentColor" : "none"} />
        </button>

        {/* Quick View Arrow */}
        <Link
          href={`/products/${product.handle}`}
          className="product-open"
          aria-hidden="true"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="product-meta">
        <div className="min-w-0 flex-1">
          <Link className="product-name" href={`/products/${product.handle}`}>
            {product.title}
          </Link>
          <span className="product-type">
            {product.productType || "Bavarian Haute Couture"}
          </span>
        </div>
        <div className="product-price">
          {onSale && <del>{formatMoney(compareAt)}</del>}
          <span>{formatMoney(minPrice)}</span>
        </div>
      </div>

      {availableVariant ? (
        <button
          type="button"
          className="quick-add"
          disabled={busy}
          onClick={handleQuickAdd}
          aria-label={`Add ${product.title} to bag`}
        >
          {added ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span>ADDED TO BAG</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>{busy ? "ADDING…" : "QUICK ADD"}</span>
            </>
          )}
        </button>
      ) : (
        <span className="product-type sold-out text-center pt-2">Currently Unavailable</span>
      )}
    </article>
  );
}
