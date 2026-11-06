import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/shopify/types";
import { ProductCard } from "@/components/product-card";

export function ProductRail({
  title,
  eyebrow,
  products,
  href,
  emptyMessage,
}: {
  title: string;
  eyebrow: string;
  products: Product[];
  href: string;
  emptyMessage?: string;
}) {
  return (
    <section className="page-shell section-pad product-section">
      <div className="section-heading">
        <div><p className="eyebrow">{eyebrow}</p><h2 className="display">{title}</h2></div>
        <Link className="text-link" href={href}>View all <ArrowRight size={15} /></Link>
      </div>
      {products.length ? (
        <div className="product-rail">{products.slice(0, 5).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <div className="empty-collection lozenge"><span className="empty-collection__symbol">✳</span><p>{emptyMessage ?? "A considered edit is on its way."}</p><Link className="link-underline" href={href}>Explore the collection</Link></div>
      )}
      <style>{`
        .text-link { display:inline-flex; align-items:center; gap:.45rem; font-size:.7rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
        .empty-collection { display:flex; min-height:245px; align-items:center; justify-content:center; flex-direction:column; gap:.55rem; border-radius:14px; text-align:center; }
        .empty-collection p { margin:.25rem 0; font-family:var(--font-display); font-size:1.3rem; }
        .empty-collection__symbol { color:var(--blue); font-size:1.5rem; }
        .empty-collection a { font-size:.78rem; }
        @media(max-width:700px) { .product-section { padding-block:4rem; } }
      `}</style>
    </section>
  );
}
