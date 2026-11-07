"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { formatMoney, imageUrl } from "@/lib/format";
import { useCart } from "./cart-provider";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const { addLine, busy } = useCart();
  const image = product.featuredImage ?? product.images.nodes[0];
  const secondImage = product.images.nodes.find((item) => item.url !== image?.url);
  const availableVariant = product.variants.nodes.find((variant) => variant.availableForSale);
  const minPrice = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const onSale = compareAt && Number(compareAt.amount) > Number(minPrice.amount);

  return (
    <article className="product-card">
      <Link href={`/products/${product.handle}`} className="product-image-wrap" aria-label={`View ${product.title}`}>
        {image ? (
          <>
            <Image className="product-image" src={imageUrl(image.url, 700)} alt={image.altText ?? product.title} width={700} height={900} />
            {secondImage && <Image className="product-image product-image-hover" src={imageUrl(secondImage.url, 700)} alt={secondImage.altText ?? `${product.title}, alternate view`} width={700} height={900} />}
          </>
        ) : <div className="image-placeholder" />}
        {onSale && <span className="product-badge">SALE</span>}
        <span className="product-open" aria-hidden="true"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="product-meta">
        <div>
          <Link className="product-name" href={`/products/${product.handle}`}>{product.title}</Link>
          <span className="product-type">{product.productType || "Bavarian collection"}</span>
        </div>
        <div className="product-price">
          {onSale && <del>{formatMoney(compareAt)}</del>}
          <span>{formatMoney(minPrice)}</span>
        </div>
      </div>
      {availableVariant && product.variants.nodes.length === 1 && (
        <button className="quick-add" disabled={busy} onClick={() => void addLine(availableVariant.id)} aria-label={`Add ${product.title} to bag`}>
          <span>{busy ? "ADDING…" : "QUICK ADD"}</span><Plus size={14} />
        </button>
      )}
      {!availableVariant && <span className="product-type sold-out">Currently unavailable</span>}
    </article>
  );
}
