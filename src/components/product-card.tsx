import Image from "next/image";
import Link from "next/link";
import { discountPercent, formatMoney } from "@/lib/format";
import type { Product } from "@/lib/shopify/types";
import { QuickAdd } from "@/components/quick-add";

export function ProductCard({ product, showQuickAdd = true }: { product: Product; showQuickAdd?: boolean }) {
  const images = product.images.nodes;
  const primaryImage = product.featuredImage ?? images[0] ?? null;
  const secondaryImage = images.find((image) => image.url !== primaryImage?.url);
  const variant = product.variants.nodes[0];
  if (!variant) return null;
  const sale = discountPercent(variant.price, variant.compareAtPrice);

  return (
    <article className="product-card">
      <div className="product-card__image">
        <Link href={`/products/${product.handle}`} aria-label={product.title}>
          {primaryImage ? (
            <>
              <Image className="product-card__primary" src={primaryImage.url} alt={primaryImage.altText ?? product.title} fill sizes="(max-width: 700px) 72vw, (max-width: 1100px) 40vw, 22vw" />
              {secondaryImage && <Image className="product-card__secondary" src={secondaryImage.url} alt={secondaryImage.altText ?? `${product.title}, alternate view`} fill sizes="(max-width: 700px) 72vw, (max-width: 1100px) 40vw, 22vw" />}
            </>
          ) : <span className="product-card__no-image">Wiesn Atelier</span>}
        </Link>
        {sale !== null && <span className="product-card__sale">Save {sale}%</span>}
      </div>
      <div className="product-card__meta">
        <Link href={`/products/${product.handle}`} className="product-card__title">{product.title}</Link>
        {product.options.find((option) => option.name.toLowerCase().includes("color")) && (
          <div className="product-card__swatches" aria-label="Available color options">
            {product.options.find((option) => option.name.toLowerCase().includes("color"))?.values.slice(0, 5).map((color, index) => <span key={color} title={color} style={{ ["--swatch" as string]: ["#785034", "#354b35", "#263f55", "#8e2b3f", "#ddd4c4"][index] }} />)}
          </div>
        )}
        <div className="product-card__price">
          <strong>{formatMoney(variant.price)}</strong>
          {variant.compareAtPrice && <del>{formatMoney(variant.compareAtPrice)}</del>}
        </div>
        {showQuickAdd && <QuickAdd variants={product.variants.nodes} productTitle={product.title} />}
      </div>
      <style>{`
        .product-card { min-width:0; }
        .product-card__image { position:relative; overflow:hidden; aspect-ratio:4/5; border-radius:14px; background:#eae5da; }
        .product-card__image a { position:absolute; inset:0; }
        .product-card__primary,.product-card__secondary { object-fit:cover; transition:transform .45s,opacity .28s; }
        .product-card__secondary { opacity:0; }
        .product-card__image:hover .product-card__primary { transform:scale(1.035); }
        .product-card__image:hover .product-card__secondary { opacity:1; }
        .product-card__sale { position:absolute; top:12px; left:12px; z-index:2; padding:.45rem .6rem; background:var(--gold); color:var(--forest); font-size:.61rem; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
        .product-card__meta { display:flex; flex-direction:column; gap:.55rem; padding:.85rem .15rem 0; }
        .product-card__title { overflow:hidden; font-family:var(--font-display); font-size:1rem; text-overflow:ellipsis; white-space:nowrap; }
        .product-card__price { display:flex; gap:.5rem; align-items:center; font-size:.78rem; }
        .product-card__price strong { font-weight:700; }
        .product-card__price del { color:var(--muted); font-size:.7rem; }
        .product-card__swatches { display:flex; gap:.35rem; }
        .product-card__swatches span { width:13px; height:13px; border:1px solid rgba(20,33,26,.2); border-radius:50%; background:var(--swatch); }
        .product-card__no-image { display:grid; width:100%; height:100%; place-items:center; font-family:var(--font-display); }
        @media(prefers-reduced-motion:reduce) { .product-card__primary,.product-card__secondary { transition:none; } }
      `}</style>
    </article>
  );
}
