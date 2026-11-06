import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ProductGallery, OptionSelectors, GiftModule, TrustBadges, OrderTracker, ProductAccordions, SizeChartModal, DescriptionBlock, BenefitsBlock, UgcCarousel, Reviews, CompleteTheLook, RatingLink } from "@/components/pdp-components";
import { JsonLd } from "@/components/json-ld";
import { getProduct, getRecommendations, getMetaobject, getMetaobjects } from "@/lib/shopify/storefront";
import { env, shopifyConfigured } from "@/lib/env";
import { formatMoney } from "@/lib/format";
import { sanitizeShopifyHtml } from "@/lib/html";
import { firstAvailableVariant } from "@/lib/products/variants";
import type { Product } from "@/lib/shopify/types";
import { getStorePolicy } from "@/lib/policy";
import { getStoredCountry } from "@/lib/shopify/cart";
import { z } from "zod";
import type { SizeChartRow } from "@/components/pdp-components";
import { RecentlyViewed } from "@/components/recently-viewed";
import { faqItems } from "@/lib/products/faqs";

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ leather?: string; size?: string }>;
};

type ProductOffer = {
  id: string;
  seasonal_eyebrow?: string;
  cta_label?: string;
  free_belt_handle?: string;
  free_suspender_handle?: string;
  belt_value?: string;
  suspender_value?: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const country = await getStoredCountry();
  const product = shopifyConfigured ? await getProduct(handle, { country }) : null;
  if (!product) {
    return { title: handle.replaceAll("-", " "), alternates: { canonical: `/products/${handle}` } };
  }
  const variant = firstAvailableVariant(product.variants.nodes);
  return {
    title: product.seo.title ?? product.title,
    description: product.seo.description ?? product.description.slice(0, 155),
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      title: product.seo.title ?? product.title,
      description: product.seo.description ?? product.description.slice(0, 155),
      images: product.featuredImage ? [{ url: product.featuredImage.url, alt: product.featuredImage.altText ?? product.title }] : [],
    },
    other: variant ? {
      "product:price:amount": variant.price.amount,
      "product:price:currency": variant.price.currencyCode,
      "product:availability": variant.availableForSale ? "in stock" : "out of stock",
    } : undefined,
  };
}

function field(product: Product, key: string) {
  return product.metafields.find((item) => item?.key === key)?.value;
}

const sizeChartRowsSchema = z.array(z.object({
  size: z.string().min(1),
  waist: z.string().min(1),
  hip: z.string().min(1),
  chest: z.string().min(1),
}));

function parseSizeChartRows(value: string | undefined): SizeChartRow[] {
  if (!value) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("The product size_chart_table metafield must contain valid JSON.", { cause: error });
    throw error;
  }
  return sizeChartRowsSchema.parse(parsed);
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const country = await getStoredCountry();
  const product = shopifyConfigured ? await getProduct(handle, { country }) : null;
  if (shopifyConfigured && !product) notFound();

  if (!product) {
    return <div className="page-shell setup-state"><p className="eyebrow">The atelier is almost ready</p><h1 className="display">Product details are waiting for Shopify.</h1><p>Connect a Storefront API token to load live variants, prices, stock and checkout links.</p><Link className="button-primary" href="/collections/lederhosen-men">Explore the collection <ArrowRight size={16} /></Link><style>{`.setup-state { display:flex; min-height:55vh; align-items:flex-start; justify-content:center; flex-direction:column; }.setup-state h1 { max-width:750px; font-size:clamp(3rem,7vw,6rem); line-height:.98; }.setup-state p:not(.eyebrow) { max-width:500px; color:var(--muted); line-height:1.6; }`}</style></div>;
  }

  const offer = await getMetaobject<ProductOffer>("pdp_offer", product.handle);
  const policy = await getStorePolicy();
  const faqEntries = await getMetaobjects<{ id: string; handle: string; question?: string; answer?: string; sort_order?: string }>("faq_item", 12);
  const ugcEntries = await getMetaobjects<{ id: string; handle: string; image_url?: string; name?: string; location?: string; product_tag?: string; consent?: string }>("ugc_item", 12);
  const dynamicFaqs = faqEntries
    .map((item) => ({ question: item.question ?? "", answer: item.answer ?? "", order: Number(item.sort_order) }))
    .filter((item) => item.question && item.answer)
    .sort((left, right) => (Number.isFinite(left.order) ? left.order : 0) - (Number.isFinite(right.order) ? right.order : 0))
    .map(({ question, answer }) => ({ question, answer }));
  const faqs = dynamicFaqs.length ? dynamicFaqs : faqItems.map(([question, answer]) => ({ question, answer }));
  const ugcItems = ugcEntries
    .filter((item) => item.consent === "true" && item.name && item.location && item.product_tag)
    .flatMap((item) => {
      const url = safeShopifyImageUrl(item.image_url);
      return url ? [{
        image: { url, altText: `${item.name} wearing ${item.product_tag}`, width: 1200, height: 1500 },
        name: item.name!,
        location: item.location!,
        tag: item.product_tag!,
      }] : [];
    });
  const giftHandles = [offer?.free_belt_handle ?? field(product, "gift_belt_handle"), offer?.free_suspender_handle ?? field(product, "gift_suspender_handle")].filter((value): value is string => Boolean(value));
  const giftProducts = giftHandles.length ? await Promise.all(giftHandles.map((giftHandle) => getProduct(giftHandle))) : [];
  const gifts = giftProducts.filter((gift): gift is Product => Boolean(gift)).map((gift, index) => {
    const variant = firstAvailableVariant(gift.variants.nodes);
    return variant ? {
      product: gift,
      variantId: variant.id,
      title: gift.title,
      value: formatMoney(variant.price),
      image: gift.featuredImage,
      labelValue: index === 0 ? offer?.belt_value : offer?.suspender_value,
    } : null;
  }).filter((gift): gift is NonNullable<typeof gift> => Boolean(gift));
  const recommendations = await getRecommendations(product.id);
  const variantOffers = product.variants.nodes.map((variant) => ({
    "@type": "Offer",
    url: `${env.NEXT_PUBLIC_SITE_URL}/products/${product.handle}?variant=${encodeURIComponent(variant.id)}`,
    priceCurrency: variant.price.currencyCode,
    price: variant.price.amount,
    availability: variant.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: "Wiesn Atelier" },
  }));
  const ratingValue = Number(field(product, "rating"));
  const ratingCountValue = Number(field(product, "rating_count"));
  const rating = Number.isFinite(ratingValue) && ratingValue > 0 ? ratingValue : null;
  const ratingCount = Number.isFinite(ratingCountValue) && ratingCountValue > 0 ? ratingCountValue : null;
  const firstVariant = firstAvailableVariant(product.variants.nodes);
  const canonical = `${env.NEXT_PUBLIC_SITE_URL}/products/${product.handle}`;
  const descriptionHtml = sanitizeShopifyHtml(product.descriptionHtml);
  const material = field(product, "material");
  const care = field(product, "care");
  const trueToSize = field(product, "true_to_size");
  const sizeChartRows = parseSizeChartRows(field(product, "size_chart_table"));
  const sizeChartImageUrl = product.metafields.find((item) => item?.key === "size_chart")?.reference?.image?.url;
  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.nodes.map((image) => image.url),
    sku: firstVariant?.sku ?? undefined,
    brand: { "@type": "Brand", name: product.vendor || "Wiesn Atelier" },
    url: canonical,
    offers: variantOffers,
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
      deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" }, transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" } },
    },
    hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", applicableCountry: "US", returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow", merchantReturnDays: 14, returnMethod: "https://schema.org/ReturnByMail" },
    ...(rating !== null && ratingCount !== null ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating, reviewCount: ratingCount } } : {}),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: env.NEXT_PUBLIC_SITE_URL },
      { "@type": "ListItem", position: 2, name: product.productType || "Shop", item: `${env.NEXT_PUBLIC_SITE_URL}/collections/${(product.productType || "all").toLowerCase().replaceAll(" ", "-")}` },
      { "@type": "ListItem", position: 3, name: product.title, item: canonical },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: question === "What is your return window?" ? policy.returnsCopy : answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={productSchema} /><JsonLd data={breadcrumbSchema} /><JsonLd data={faqSchema} />
      <div className="page-shell pdp">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={`/collections/${(product.productType || "all").toLowerCase().replaceAll(" ", "-")}`}>{product.productType || "Collection"}</Link><span>/</span><span aria-current="page">{product.title}</span></nav>
        <div className="pdp-grid">
          <ProductGallery product={product} />
          <section className="buy-box stitch" aria-label="Product purchase options">
            {offer?.seasonal_eyebrow && <p className="eyebrow seasonal-eyebrow">{offer.seasonal_eyebrow}</p>}
            <h1 className="display">{product.title}</h1>
            <RatingLink rating={rating} ratingCount={ratingCount} />
            {gifts.length > 0 && <GiftModule gifts={gifts.map((gift) => ({ title: gift.title, value: gift.labelValue || gift.value, image: gift.image }))} />}
            <OptionSelectors product={product} gifts={gifts.map(({ product: gift, variantId, value }) => ({ product: gift, variantId, value }))} ctaLabel={offer?.cta_label} />
            <SizeChartModal
              productTitle={product.title}
              trueToSize={trueToSize ?? undefined}
              sizes={product.options.find((option) => option.name.toLowerCase().includes("size"))?.values ?? []}
              chartRows={sizeChartRows}
              chartImageUrl={sizeChartImageUrl}
            />
            <TrustBadges threshold={formatMoney({ amount: String(policy.shippingThresholdUSD), currencyCode: "USD" })} returnDays={policy.returnWindowDays} />
            <OrderTracker leadDays={policy.leadTimeBusinessDays} transitMinDays={policy.transitMinBusinessDays} transitMaxDays={policy.transitMaxBusinessDays} />
            <ProductAccordions material={material ?? undefined} care={care ?? undefined} returnsCopy={policy.returnsCopy} shippingCopy={policy.shippingCopy} faqs={faqs} />
          </section>
        </div>
      </div>
      <DescriptionBlock product={{ ...product, descriptionHtml }} />
      <BenefitsBlock leather={product.options.find((option) => option.name.toLowerCase().includes("leather"))?.values[0] ?? "Cow leather"} />
      <UgcCarousel items={ugcItems} />
      <Reviews rating={rating} ratingCount={ratingCount} />
      <CompleteTheLook products={recommendations} />
      {firstVariant && <RecentlyViewed item={{ handle: product.handle, title: product.title, image: product.featuredImage, amount: firstVariant.price.amount, currencyCode: firstVariant.price.currencyCode }} />}
      <style>{`
        .pdp { padding-bottom:4rem; }.breadcrumbs { display:flex; align-items:center; gap:.55rem; overflow:hidden; padding-block:1.1rem; font-size:.66rem; text-transform:capitalize; white-space:nowrap; }
        .breadcrumbs span { color:var(--muted); }.breadcrumbs span:last-child { overflow:hidden; color:var(--forest); text-overflow:ellipsis; }
        .pdp-grid { display:grid; grid-template-columns:minmax(0,7fr) minmax(340px,5fr); gap:clamp(2rem,4vw,4rem); align-items:start; }
        .buy-box { display:flex; flex-direction:column; gap:1rem; border-radius:14px; padding:clamp(1.2rem,2.4vw,2.3rem); background:rgba(255,255,255,.2); }
        .buy-box h1 { margin:0; font-size:clamp(2.4rem,4.2vw,4.4rem); line-height:.98; }.seasonal-eyebrow { margin:0; color:var(--berry); }
        .rating-line { display:flex; align-items:center; gap:.42rem; width:max-content; border:0; background:transparent; padding:0; font-size:.65rem; cursor:pointer; }.rating-line>span { display:flex; gap:1px; color:var(--gold); }.rating-line u { color:var(--muted); text-underline-offset:2px; }
        @media(min-width:1280px) { .pdp-grid { grid-template-columns:minmax(0,7fr) minmax(420px,5fr); } }
        @media(max-width:800px) { .pdp-grid { grid-template-columns:1fr; gap:1.4rem; }.buy-box { padding:1.1rem; }.buy-box h1 { font-size:2.6rem; } }
      `}</style>
    </>
  );
}

function safeShopifyImageUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "cdn.shopify.com" || url.hostname.endsWith(".myshopify.com"))
      ? url.toString()
      : null;
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
}
