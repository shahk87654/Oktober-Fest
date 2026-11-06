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
      <div className="pdp-page">
      <div className="page-shell pdp">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={`/collections/${(product.productType || "all").toLowerCase().replaceAll(" ", "-")}`}>{product.productType || "Collection"}</Link><span>/</span><span aria-current="page">{product.title}</span></nav>
        <div className="pdp-grid">
          <ProductGallery product={product} />
          <section className="buy-box" aria-label="Product purchase options">
            <div className="pdp-editorial-tag"><span aria-hidden="true">✳</span><p>{product.vendor || "Wiesn Atelier"} <i>/</i> {product.productType || "The Wiesn edit"}</p><b>01 — CONSIDERED CRAFT</b></div>
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
        .pdp-page { overflow:clip; background:#f6f4ec; }
        .pdp { padding-bottom:clamp(4rem,8vw,7rem); }
        .breadcrumbs { display:flex; align-items:center; gap:.65rem; overflow:hidden; padding-block:1.25rem; color:#77796e; font-size:.63rem; letter-spacing:.04em; text-transform:capitalize; white-space:nowrap; }
        .breadcrumbs a { transition:color .2s; }.breadcrumbs a:hover { color:#536337; }
        .breadcrumbs span { color:#a0a092; }.breadcrumbs span:last-child { overflow:hidden; color:#17251c; text-overflow:ellipsis; }
        .pdp-grid { display:grid; grid-template-columns:minmax(0,7.3fr) minmax(360px,4.7fr); gap:clamp(2rem,4vw,4.5rem); align-items:start; }
        .buy-box { position:relative; display:flex; flex-direction:column; gap:1.2rem; border:0; border-top:3px solid #d8e85e; border-radius:0; padding:clamp(1.3rem,2.7vw,2.4rem); background:#fbfaf6; box-shadow:0 18px 55px rgba(37,44,28,.06); }
        .buy-box::before { position:absolute; top:-3px; right:0; width:22%; height:3px; content:""; background:#17251c; }
        .pdp-editorial-tag { display:grid; grid-template-columns:34px 1fr auto; align-items:center; gap:.65rem; padding-bottom:1rem; border-bottom:1px solid rgba(23,37,28,.12); }
        .pdp-editorial-tag>span { display:grid; width:34px; height:34px; place-items:center; border-radius:50%; background:#d8e85e; color:#17251c; font-size:1rem; }
        .pdp-editorial-tag p { margin:0; color:#4e5941; font-size:.61rem; font-weight:750; letter-spacing:.075em; text-transform:uppercase; }
        .pdp-editorial-tag p i { padding-inline:.2rem; color:#a3a697; font-style:normal; }
        .pdp-editorial-tag b { color:#858779; font-size:.52rem; letter-spacing:.11em; }
        .buy-box h1 { max-width:620px; margin:0; font-size:clamp(2.8rem,4.7vw,5.1rem); line-height:.87; letter-spacing:-.065em; text-wrap:balance; }
        .seasonal-eyebrow { margin:0; color:#66723e!important; }
        .rating-line { display:flex; align-items:center; gap:.42rem; width:max-content; border:0; background:transparent; padding:0; font-size:.65rem; cursor:pointer; }
        .rating-line>span { display:flex; gap:1px; color:#89952d; }.rating-line u { color:#77796e; text-underline-offset:3px; }
        .pdp-page .button-primary { border-radius:3px; background:#d8e85e; border-color:#d8e85e; color:#17251c; }
        .pdp-page .button-primary:hover { background:#e7f290; }
        @media(min-width:1280px) { .pdp-grid { grid-template-columns:minmax(0,7fr) minmax(420px,5fr); } }
        @media(max-width:800px) {
          .pdp { padding-bottom:3rem; }
          .pdp-grid { grid-template-columns:1fr; gap:1.2rem; }
          .buy-box { gap:1rem; padding:1.2rem 1rem; }
          .buy-box h1 { font-size:clamp(2.8rem,10vw,4rem); }
          .pdp-editorial-tag { grid-template-columns:32px 1fr; }
          .pdp-editorial-tag b { grid-column:2; margin-top:-.4rem; }
        }
      `}</style>
      </div>
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
