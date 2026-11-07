import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product-details";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getShopPaymentSettings } from "@/lib/shopify/content";
import { getProduct } from "@/lib/shopify/products";
import { getProductRecommendations } from "@/lib/shopify/recommendations";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  if (!isShopifyConfigured()) return { title: "Product" };
  const product = await getProduct(handle);
  if (!product) return { title: "Piece not found" };
  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description.slice(0, 155),
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      type: "website",
      title: product.seo.title || product.title,
      description: product.seo.description || product.description.slice(0, 155),
      images: product.featuredImage ? [product.featuredImage.url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (!isShopifyConfigured()) return <main className="store-setup"><span className="eyebrow">LIVE FROM THE ATELIER</span><h1>Your next piece,<br /><em>awaits.</em></h1><p>Connect Shopify to view live product details, variants and availability.</p></main>;
  const [product, paymentSettings] = await Promise.all([getProduct(handle), getShopPaymentSettings()]);
  if (!product) notFound();
  const recommendations = await getProductRecommendations(product.id).catch((error: unknown) => {
    console.error("Unable to load Shopify product recommendations.", error);
    return [];
  });
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.nodes.map((image) => image.url),
    sku: product.variants.nodes[0]?.sku || undefined,
    brand: { "@type": "Brand", name: product.vendor || "Alpine Atelier" },
    offers: product.variants.nodes.map((variant) => ({
      "@type": "Offer",
      priceCurrency: variant.price.currencyCode,
      price: variant.price.amount,
      availability: variant.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: product.onlineStoreUrl || undefined,
    })),
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><ProductDetails product={product} recommendations={recommendations.filter((item) => item.id !== product.id)} paymentSettings={paymentSettings} /></>;
}
