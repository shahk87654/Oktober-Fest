"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, Check, ChevronLeft, ChevronRight, LockKeyhole, MessageCircleQuestion, Minus, PackageCheck, Plus, RotateCcw, ScanLine, ShieldCheck, Star, Truck, X } from "lucide-react";
import type { ShopifyPaymentSettings, ShopifyProduct } from "@/lib/shopify/types";
import { formatMoney, imageUrl } from "@/lib/format";
import { useCart } from "./cart-provider";
import { ProductCard } from "./product-card";
import { RecentlyViewedProducts } from "./recently-viewed-products";

interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  date?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseReviewEntries(value: string | undefined): { reviews: ProductReview[]; invalid: boolean } {
  if (!value?.trim()) return { reviews: [], invalid: false };

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { reviews: [], invalid: true };
  }
  if (!Array.isArray(parsed)) return { reviews: [], invalid: true };

  let invalid = false;
  const reviews: ProductReview[] = [];
  parsed.forEach((entry, index) => {
    if (!isRecord(entry)) {
      invalid = true;
      return;
    }
    const author = typeof entry.author === "string" ? entry.author.trim() : "";
    const body = typeof entry.body === "string" ? entry.body.trim() : "";
    const rating = entry.rating;
    const date = typeof entry.date === "string" && !Number.isNaN(Date.parse(entry.date)) ? entry.date : undefined;
    if (!author || !body || typeof rating !== "number" || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      invalid = true;
      return;
    }
    if (entry.date !== undefined && !date) invalid = true;
    reviews.push({
      id: typeof entry.id === "string" && entry.id.trim() ? entry.id : `${author}-${date ?? index}`,
      author,
      rating,
      title: typeof entry.title === "string" ? entry.title.trim() || undefined : undefined,
      body,
      date,
    });
  });
  return { reviews, invalid };
}

function parseShopifyRating(value: string | undefined): number | null {
  if (!value) return null;
  let parsed: unknown = value;
  try {
    parsed = JSON.parse(value);
  } catch {
    // Plain numeric metafield values are supported alongside Shopify's rating JSON value.
  }
  const rating = typeof parsed === "number" ? parsed : isRecord(parsed) ? parsed.value : Number(value);
  return typeof rating === "number" && Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

function parseShopifyReviewCount(value: string | undefined): number | null {
  if (!value) return null;
  const count = Number(value);
  return Number.isInteger(count) && count >= 0 ? count : null;
}

const paymentMethodLabels: Record<string, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  AMERICAN_EXPRESS: "Amex",
  DISCOVER: "Discover",
  DINERS_CLUB: "Diners Club",
  SHOPIFY_PAY: "Shop Pay",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
};

function PaymentLogo({ method }: { method: string }) {
  switch (method) {
    case "VISA":
      return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1434CB" d="M9.112 8.262 5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 0 1 .894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 0 1 1.913.336l.34-1.59a5.207 5.207 0 0 0-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 0 0-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656 1.02-2.815.588 2.815zm-8.16-4.84-1.603 7.496H8.34l1.605-7.496z"/></svg>;
    case "MASTERCARD":
      return <svg viewBox="0 0 32 22" aria-hidden="true"><circle cx="12" cy="11" r="9" fill="#EB001B" /><circle cx="20" cy="11" r="9" fill="#F79E1B" fillOpacity=".94" /><path fill="#FF5F00" d="M16 3.26a9 9 0 0 1 0 15.48 9 9 0 0 1 0-15.48" /></svg>;
    case "AMERICAN_EXPRESS":
      return <svg viewBox="0 0 42 26" aria-hidden="true"><rect width="42" height="26" rx="3" fill="#2467A8" /><text x="21" y="11" fill="white" fontSize="8" fontWeight="800" textAnchor="middle">AMERICAN</text><text x="21" y="20" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">EXPRESS</text></svg>;
    case "DISCOVER":
      return <svg viewBox="0 0 54 22" aria-hidden="true"><text x="1" y="15" fill="#242321" fontSize="10" fontWeight="800" letterSpacing="-.4">DISCOVER</text><path d="M37 18a11 11 0 0 0 13-9 12 12 0 0 1-13 9Z" fill="#F58220" /></svg>;
    case "DINERS_CLUB":
      return <svg viewBox="0 0 54 22" aria-hidden="true"><circle cx="11" cy="11" r="9" fill="#1675A9" /><path d="M11 3a8 8 0 0 0 0 16V3Zm1 0v16a8 8 0 0 0 0-16Z" fill="white" /><text x="23" y="14" fill="#2467A8" fontSize="8" fontWeight="700">DINERS</text></svg>;
    case "SHOPIFY_PAY":
    case "SHOP_PAY":
      return <svg viewBox="0 0 44 24" aria-hidden="true"><rect width="44" height="24" rx="4" fill="#5433EB" /><path d="M9 8h6l1 11h-8l1-11Zm2-1c0-2 1-3 2-3s2 1 2 3" fill="none" stroke="white" strokeWidth="1.5" /><text x="28" y="15.5" fill="white" fontSize="8" fontWeight="700" textAnchor="middle">shop</text></svg>;
    case "APPLE_PAY":
      return <svg viewBox="0 0 54 24" aria-hidden="true"><path fill="#111" d="M13.5 6.2c-.7 0-1.5.5-1.8 1.1-.3.5-.6 1.3-.5 2 .7.1 1.4-.3 1.8-.8.4-.5.7-1.3.6-2-.1-.2-.1-.3-.1-.3Zm3.2 5.6c0-1.1.9-1.7.9-1.7-.5-.8-1.3-.9-1.6-.9-.7-.1-1.3.4-1.7.4-.3 0-.9-.4-1.5-.4-.8 0-1.5.5-1.9 1.2-.8 1.4-.2 3.5.6 4.6.4.6.8 1.1 1.4 1.1.5 0 .8-.3 1.4-.3s.8.3 1.4.3c.6 0 1-.5 1.4-1.1.5-.7.7-1.2.7-1.3-.1 0-1.1-.4-1.1-1.9Z" /><text x="21" y="15" fill="#111" fontSize="10" fontWeight="600">Pay</text></svg>;
    case "GOOGLE_PAY":
      return <svg viewBox="0 0 55 24" aria-hidden="true"><text x="2" y="17" fill="#4285F4" fontSize="18" fontWeight="700">G</text><text x="19" y="15.5" fill="#5F6368" fontSize="9" fontWeight="600">Pay</text><path d="M8 3a8 8 0 0 1 5 2l-2 2a5 5 0 0 0-3-1" fill="#34A853" /><path d="M3 9a5 5 0 0 0 0 5l-2 2a8 8 0 0 1 0-9Z" fill="#FBBC04" /></svg>;
    default:
      return null;
  }
}

export function ProductDetails({ product, recommendations, paymentSettings }: {
  product: ShopifyProduct;
  recommendations: ShopifyProduct[];
  paymentSettings: ShopifyPaymentSettings;
}) {
  const variants = product.variants.nodes;
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.filter((option) => option.values.length === 1).map((option) => [option.name, option.values[0]])),
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [recommendationType, setRecommendationType] = useState("ALL");
  const { addLine, busy } = useCart();
  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.selectedOptions.every((option) => selectedOptions[option.name] === option.value)) ?? null,
    [variants, selectedOptions],
  );
  const images = product.images.nodes.length ? product.images.nodes : product.featuredImage ? [product.featuredImage] : [];
  const editorialImage = product.featuredImage ?? images[0];
  const visibleImage = selectedVariant?.image
    ? selectedVariant.image
    : images[activeImage] ?? product.featuredImage;
  const missingOption = product.options.some((option) => !selectedOptions[option.name] && option.values.length > 1);
  const purchasable = selectedVariant ? selectedVariant.availableForSale : !missingOption && variants.length === 1 && variants[0].availableForSale;
  const metafield = (key: string, namespace = "custom") =>
    product.metafields?.find((field) => field?.key === key && field.namespace === namespace)?.value;
  const materials = metafield("materials");
  const care = metafield("care");
  const fit = metafield("fit");
  const reviewEntriesValue = metafield("review_entries");
  const reviewEntries = useMemo(() => parseReviewEntries(reviewEntriesValue), [reviewEntriesValue]);
  const reviewEntryRating = reviewEntries.reviews.length
    ? reviewEntries.reviews.reduce((total, review) => total + review.rating, 0) / reviewEntries.reviews.length
    : null;
  const shopifyRatingCount = parseShopifyReviewCount(metafield("rating_count", "reviews"));
  const reviewCount = shopifyRatingCount && shopifyRatingCount > 0 ? shopifyRatingCount : reviewEntries.reviews.length;
  const reviewRating = parseShopifyRating(metafield("rating", "reviews")) ?? reviewEntryRating;
  const [showAllReviews, setShowAllReviews] = useState(false);
  const visibleReviews = showAllReviews ? reviewEntries.reviews : reviewEntries.reviews.slice(0, 3);
  const sizeOption = product.options.find((option) => /size/i.test(option.name));
  const passportItems = [
    { label: "PIECE", value: product.title },
    { label: "CATEGORY", value: product.productType },
    { label: "MAKER", value: product.vendor },
    { label: "STYLE CODE", value: selectedVariant?.sku },
    { label: "MATERIAL", value: materials },
    { label: "CARE", value: care },
    { label: "FIT", value: fit },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));
  const recommendationTypes = Array.from(new Set(recommendations.map((item) => item.productType).filter(Boolean)));
  const visibleRecommendations = recommendationType === "ALL"
    ? recommendations
    : recommendations.filter((item) => item.productType === recommendationType);
  const paymentMethods = [...paymentSettings.acceptedCardBrands, ...paymentSettings.supportedDigitalWallets]
    .filter((method) => paymentMethodLabels[method]);

  function isOptionValueAvailable(name: string, value: string) {
    return variants.some((variant) =>
      variant.availableForSale &&
      variant.selectedOptions.every((option) =>
        option.name === name ? option.value === value : !selectedOptions[option.name] || selectedOptions[option.name] === option.value,
      ),
    );
  }

  async function addToBag() {
    const variant = selectedVariant ?? variants[0];
    if (!variant?.availableForSale) return;
    if (await addLine(variant.id, quantity)) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    }
  }

  function setOption(name: string, value: string) {
    setSelectedOptions((current) => ({ ...current, [name]: value }));
    setActiveImage(0);
  }

  return (
    <>
      <main className="product-page">
        <div className="product-gallery">
          <div className="product-gallery-main" onTouchStart={(event) => {
          event.currentTarget.dataset.touchStartX = String(event.touches[0]?.clientX ?? 0);
          }} onTouchEnd={(event) => {
          const start = Number(event.currentTarget.dataset.touchStartX ?? 0);
          const end = event.changedTouches[0]?.clientX;
          if (end === undefined) return;
          const delta = end - start;
            if (Math.abs(delta) > 55 && images.length > 1) setActiveImage((activeImage + (delta < 0 ? 1 : -1) + images.length) % images.length);
          }}>
          <span className="gallery-edition">ALPINE ATELIER <i /> OBJECT STUDY</span>
          {visibleImage && <button className="gallery-zoom" type="button" onClick={() => setZoomed(true)} aria-label="Zoom product image"><Image src={imageUrl(visibleImage.url, 1400)} alt={visibleImage.altText ?? product.title} fill priority sizes="(max-width: 800px) 100vw, 58vw" /></button>}
          {!visibleImage && <div className="image-placeholder" />}
          {images.length > 1 && <div className="gallery-arrows"><button aria-label="Previous image" onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}><ChevronLeft size={17} /></button><button aria-label="Next image" onClick={() => setActiveImage((activeImage + 1) % images.length)}><ChevronRight size={17} /></button></div>}
          <span className="gallery-index"><ScanLine size={14} /> FRAME {String(activeImage + 1).padStart(2, "0")} <i /> {String(images.length).padStart(2, "0")}</span>
          <span className="gallery-zoom-hint">SELECT IMAGE TO EXPLORE</span>
          </div>
          {images.length > 1 && <div className="product-thumbnails">{images.map((image, index) => <button key={image.url} className={index === activeImage ? "active" : ""} onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}`}><Image src={imageUrl(image.url, 180)} alt={image.altText ?? `${product.title} image ${index + 1}`} width={76} height={95} /></button>)}</div>}
        </div>
        <div className="product-information">
          <div className="pdp-interface-label"><span>PRODUCT / {product.productType || "ATELIER"}</span><span>01 — {String(images.length).padStart(2, "0")} VISUALS</span></div>
          <div className="product-breadcrumb"><Link href="/">HOME</Link><span>/</span><span>{product.productType || "COLLECTION"}</span></div>
          <header className="pdp-heading">
            <span className="eyebrow product-vendor">{product.vendor || "ALPINE ATELIER"}</span>
            <h1>{product.title}</h1>
          </header>
          <div className="pdp-price-panel">
            <div className="pdp-price">
              <span className="pdp-price-caption">PRICE</span>
              <strong>{formatMoney(selectedVariant?.price ?? product.priceRange.minVariantPrice)}</strong>
              {(() => {
                const compare = selectedVariant?.compareAtPrice ?? product.compareAtPriceRange.minVariantPrice;
                const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
                return compare && Number(compare.amount) > Number(price.amount) ? <del>{formatMoney(compare)}</del> : null;
              })()}
            </div>
            <div className={`pdp-stock ${purchasable ? "is-available" : "is-unavailable"}`}>
              <span className="stock-dot" />
              <span>{purchasable ? "AVAILABLE" : selectedVariant ? "UNAVAILABLE" : "SELECT OPTIONS"}</span>
              <small>{purchasable ? "READY TO ADD" : "CHECK SELECTION"}</small>
            </div>
          </div>
          {product.description && (
            <section className="pdp-description-block" aria-labelledby="pdp-description-title">
              <span className="pdp-description-index" aria-hidden="true">01</span>
              <div className="pdp-description-copy">
                <header className="pdp-description-heading">
                  <h2 id="pdp-description-title">The piece</h2>
                  <span>ATELIER NOTES</span>
                </header>
                <p className="pdp-description">{product.description}</p>
              </div>
            </section>
          )}

          <div className="variant-options" id="pdp-options">
            <div className="pdp-section-label">02 / SELECT YOUR CONFIGURATION</div>
            {product.options.map((option) => {
              if (option.values.length === 1 && option.values[0] === "Default Title") return null;
              const current = selectedOptions[option.name];
              return (
                <fieldset key={option.name} className="variant-group">
                  <legend>{option.name}<span>{current || "Select an option"}{option.name.toLowerCase().includes("size") && <Link href="/pages/size-guide" className="size-guide-link">SIZE GUIDE</Link>}</span></legend>
                  <div className="variant-values">
                    {option.values.map((value) => {
                      const available = isOptionValueAvailable(option.name, value);
                      return <button key={value} className={`${current === value ? "selected" : ""} ${!available ? "unavailable" : ""}`} onClick={() => setOption(option.name, value)} type="button" aria-label={`${option.name}: ${value}${available ? "" : ", unavailable"}`} aria-pressed={current === value} disabled={!available}>{value}{!available && <span className="variant-strike" />}</button>;
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>
          <div className="pdp-purchase">
            <div className="quantity-control pdp-quantity"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></button></div>
            <button className="button button-dark add-to-bag" disabled={!purchasable || busy} onClick={() => void addToBag()}>{added ? <>ADDED TO YOUR BAG <Check size={16} /></> : busy ? "ADDING…" : !purchasable ? "SELECT AN AVAILABLE OPTION" : <>ADD TO BAG <ArrowRight size={16} /></>}</button>
          </div>
          {paymentMethods.length > 0 && <div className="pdp-payment-methods" aria-label={`Accepted payment methods: ${paymentMethods.map((method) => paymentMethodLabels[method]).join(", ")}`}>
            {paymentMethods.map((method) => <span className="pdp-payment-mark" key={method} title={paymentMethodLabels[method]} role="img" aria-label={paymentMethodLabels[method]}><PaymentLogo method={method} /></span>)}
          </div>}
          <div className={`pdp-live-note ${purchasable ? "is-ready" : ""}`}>
            <span className="pdp-live-indicator" />
            <div>
              <span className="pdp-live-label">LIVE AVAILABILITY</span>
              <p>{selectedVariant ? purchasable ? `${selectedVariant.title} is available to add right now.` : `${selectedVariant.title} is currently unavailable.` : "Choose your options to check current availability."}</p>
            </div>
            {!selectedVariant && <a href="#pdp-options" aria-label="Choose product options"><ArrowRight size={17} /></a>}
          </div>
          {!product.availableForSale && <p className="form-error">This piece is currently unavailable.</p>}
          <div className="pdp-assurances"><p><span>SHIPPING</span>Delivery options and rates are shown at checkout.</p><p><span>DETAILS</span>{product.productType || "Designed with care"}{product.vendor ? ` · ${product.vendor}` : ""}</p>{selectedVariant?.sku && <p><span>STYLE</span>{selectedVariant.sku}</p>}</div>
          <div className="pdp-spec-label">03 / PRODUCT INTELLIGENCE <span>LIVE FROM SHOPIFY</span></div>
          <details className="pdp-accordion">
            <summary><span><Truck size={16} /> SHIPPING & RETURNS</span><Plus size={14} /></summary>
            <p>Shipping methods, rates and delivery estimates are shown at checkout. Review the store&apos;s current shipping and return policies before ordering.</p>
            <div className="pdp-accordion-links"><Link className="text-link" href="/policies/shipping-policy">SHIPPING POLICY <ArrowRight size={13} /></Link><Link className="text-link" href="/policies/refund-policy">RETURNS POLICY <ArrowRight size={13} /></Link></div>
          </details>
          <details className="pdp-accordion">
            <summary><span><MessageCircleQuestion size={16} /> PRODUCT FAQs</span><Plus size={14} /></summary>
            <div className="pdp-faq-list">
              <div><h3>How do I choose a size?</h3><p>{fit || "Review the available size options and use the size guide to help choose your fit."} <Link href="/pages/size-guide">View size guide</Link></p></div>
              <div><h3>When will my order arrive?</h3><p>Current delivery estimates are provided with the available shipping methods at checkout.</p></div>
              <div><h3>Is this option available?</h3><p>Availability updates from Shopify when you select a product option above.</p></div>
            </div>
          </details>
          <details className="pdp-accordion">
            <summary><span><Award size={16} /> MATERIALS & CARE</span><Plus size={14} /></summary>
            <p>{[materials, care].filter(Boolean).join("\n\n") || "Material and care information will appear here when provided in this product's Shopify listing."}</p>
          </details>
          <div className="pdp-tags">{product.tags.slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
      </main>
      <section className="pdp-editorial section" aria-labelledby="pdp-editorial-title">
        <div className="pdp-editorial-image">
          {editorialImage && <Image src={imageUrl(editorialImage.url, 1100)} alt={editorialImage.altText ?? product.title} fill sizes="(max-width: 700px) 100vw, 52vw" />}
          <span>ATELIER STUDY / {product.productType || "01"}</span>
        </div>
        <div className="pdp-editorial-copy">
          <span className="eyebrow">A CLOSER LOOK <i /></span>
          <h2 id="pdp-editorial-title">Tradition, in <em>your own way.</em></h2>
          <p>Distinctive details make this {product.productType ? product.productType.toLowerCase() : "piece"} your own. Choose the option that feels right and make it part of your next occasion.</p>
          {product.tags.length > 0 && <div className="pdp-editorial-tags">{product.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>}
          <a className="pdp-editorial-link" href="#pdp-options">FIND YOUR OPTION <ArrowRight size={15} /></a>
        </div>
      </section>
      <section className="pdp-trust section" aria-label="Shopping information">
        <div className="pdp-trust-heading"><span className="eyebrow">THE DETAILS, TAKEN CARE OF</span><span>ALPINE ATELIER / SERVICE</span></div>
        <div className="pdp-trust-grid">
          <article><span className="pdp-trust-icon"><Truck size={18} /></span><div><h2>Shipping details</h2><p>Available methods, rates and estimates are shown at checkout.</p></div></article>
          <article><span className="pdp-trust-icon"><LockKeyhole size={18} /></span><div><h2>Secure checkout</h2><p>Payment and order completion are handled by Shopify.</p></div></article>
          <article><span className="pdp-trust-icon"><RotateCcw size={18} /></span><div><h2>Returns information</h2><p>Review the store&apos;s return policy before placing your order.</p></div></article>
          <article><span className="pdp-trust-icon"><ShieldCheck size={18} /></span><div><h2>Live product details</h2><p>Price, selected options and availability come from Shopify.</p></div></article>
        </div>
        <div className="pdp-delivery-timeline" aria-label="Order journey">
          <article><span className="pdp-timeline-icon"><PackageCheck size={18} /></span><div><strong>ORDER</strong><small>Complete checkout</small></div></article>
          <i aria-hidden="true" />
          <article><span className="pdp-timeline-icon"><Truck size={18} /></span><div><strong>FULFILMENT</strong><small>Updates after purchase</small></div></article>
          <i aria-hidden="true" />
          <article><span className="pdp-timeline-icon"><Award size={18} /></span><div><strong>DELIVERY</strong><small>Estimate at checkout</small></div></article>
        </div>
      </section>
      <section className="pdp-reviews section" id="pdp-reviews" aria-labelledby="pdp-reviews-title">
        <div className="pdp-reviews-heading">
          <div>
            <span className="eyebrow">CUSTOMER NOTES / LIVE FROM SHOPIFY</span>
            <h2 id="pdp-reviews-title">Worn & <em>remembered.</em></h2>
          </div>
          <span className="pdp-review-count">{String(reviewCount).padStart(2, "0")} {reviewCount === 1 ? "REVIEW" : "REVIEWS"}</span>
        </div>
        {reviewCount > 0 && reviewRating !== null && <div className="pdp-review-summary">
          <div className="pdp-review-stars" role="img" aria-label={`${reviewRating.toFixed(1)} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} fill={index < Math.round(reviewRating) ? "currentColor" : "none"} />)}
          </div>
          <strong>{reviewRating.toFixed(1)} <span>/ 5</span></strong>
          <span>AVERAGE SHOPIFY RATING</span>
        </div>}
        {reviewEntries.invalid && <p className="pdp-review-warning" role="status">Some reviews could not be displayed. Check the Shopify <code>custom.review_entries</code> metafield format.</p>}
        {visibleReviews.length > 0
          ? <div className="pdp-review-list">{visibleReviews.map((review) => <article className="pdp-review-card" key={review.id}>
            <div className="pdp-review-card-top">
              <span className="pdp-review-stars" role="img" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} fill={index < Math.round(review.rating) ? "currentColor" : "none"} />)}
              </span>
              {review.date && <time dateTime={review.date}>{review.date}</time>}
            </div>
            {review.title && <h3>{review.title}</h3>}
            <p>{review.body}</p>
            <span className="pdp-review-author">{review.author}</span>
          </article>)}</div>
          : reviewCount > 0
            ? <p className="pdp-review-empty">Shopify has a rating summary, but written review details aren&apos;t available in the product metafields.</p>
            : <p className="pdp-review-empty">No customer reviews have been published for this piece yet.</p>}
        {reviewEntries.reviews.length > 3 && <button className="pdp-review-toggle" type="button" onClick={() => setShowAllReviews((show) => !show)}>
          {showAllReviews ? "SHOW FEWER REVIEWS" : `SHOW ALL ${reviewEntries.reviews.length} REVIEWS`} <ArrowRight size={14} />
        </button>}
      </section>
      {passportItems.length > 0 && <section className="pdp-passport section" aria-labelledby="pdp-passport-title">
        <div className="pdp-passport-intro">
          <span className="eyebrow">THE ALPINE ATELIER / ARCHIVE</span>
          <h2 id="pdp-passport-title">The piece, <em>on record.</em></h2>
          <p>Live details from the Shopify product listing, including your current variant selection.</p>
        </div>
        <dl className="pdp-passport-grid">
          {passportItems.map((item, index) => <div key={item.label}><dt><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</dt><dd>{item.value}</dd></div>)}
          {selectedVariant && <div><dt><span>{String(passportItems.length + 1).padStart(2, "0")}</span>SELECTED OPTION</dt><dd>{selectedVariant.title}</dd></div>}
        </dl>
      </section>}
      {sizeOption && <section className="pdp-fit-section section" aria-labelledby="pdp-fit-title">
        <div className="pdp-fit-copy">
          <span className="eyebrow">A MORE PERSONAL FIT</span>
          <h2 id="pdp-fit-title">Find your <em>measure.</em></h2>
          <p>{fit || "Choose from the sizes currently offered for this piece. Availability updates with your selection."}</p>
          <Link href="/pages/size-guide" className="pdp-fit-link">OPEN SIZE GUIDE <ArrowRight size={15} /></Link>
        </div>
        <div className="pdp-fit-options">
          <div className="pdp-fit-label"><span>{sizeOption.name.toUpperCase()}</span><span>{selectedOptions[sizeOption.name] || "SELECT A SIZE"}</span></div>
          <div className="pdp-fit-values">
            {sizeOption.values.map((value) => {
              const available = isOptionValueAvailable(sizeOption.name, value);
              const selected = selectedOptions[sizeOption.name] === value;
              return <button key={value} type="button" className={`${selected ? "selected" : ""} ${available ? "" : "unavailable"}`} aria-label={`${value}, ${available ? "available" : "unavailable"}`} aria-pressed={selected} disabled={!available} onClick={() => setOption(sizeOption.name, value)}>
                <span>{value}</span><small><i />{available ? "IN STOCK" : "UNAVAILABLE"}</small>
              </button>;
            })}
          </div>
        </div>
      </section>}
      {recommendations.length > 0 && <section className="section recommendations" aria-labelledby="product-recommender-title">
        <div className="pdp-recommender-heading">
          <div><span className="eyebrow">CURATED BY SHOPIFY</span><h2 id="product-recommender-title">The <em>recommender.</em></h2><p>Explore pieces selected from the live catalog to complement this one.</p></div>
          <span className="pdp-recommender-count">{String(visibleRecommendations.length).padStart(2, "0")} / {String(recommendations.length).padStart(2, "0")} PIECES</span>
        </div>
        {recommendationTypes.length > 1 && <div className="pdp-recommender-filters" role="group" aria-label="Filter recommendations by product type">
          <span>EXPLORE BY</span>
          <button type="button" className={recommendationType === "ALL" ? "active" : ""} aria-pressed={recommendationType === "ALL"} onClick={() => setRecommendationType("ALL")}>ALL</button>
          {recommendationTypes.map((type) => <button type="button" key={type} className={recommendationType === type ? "active" : ""} aria-pressed={recommendationType === type} onClick={() => setRecommendationType(type)}>{type.toUpperCase()}</button>)}
        </div>}
        {visibleRecommendations.length > 0
          ? <div className="product-grid">{visibleRecommendations.slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}</div>
          : <p className="pdp-recommender-empty">No recommendations in this category yet. Try another edit.</p>}
      </section>}
      <RecentlyViewedProducts currentHandle={product.handle} />
      {zoomed && visibleImage && <div className="image-zoom-modal" role="dialog" aria-modal="true" aria-label="Product image zoom" onClick={() => setZoomed(false)}><button type="button" aria-label="Close zoom"><X size={20} /></button><Image src={imageUrl(visibleImage.url, 1800)} alt={visibleImage.altText ?? product.title} fill sizes="100vw" priority /></div>}
    </>
  );
}
