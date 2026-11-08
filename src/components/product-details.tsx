"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
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

function parseRating(value: string | undefined): number | null {
  if (!value) return null;
  let parsed: unknown = value;
  try {
    parsed = JSON.parse(value);
  } catch {
    // Plain number fallback
  }
  const rating = typeof parsed === "number" ? parsed : isRecord(parsed) ? parsed.value : Number(value);
  return typeof rating === "number" && Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

function parseReviewCount(value: string | undefined): number | null {
  if (!value) return null;
  const count = Number(value);
  return Number.isInteger(count) && count >= 0 ? count : null;
}

const paymentLabels: Record<string, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  AMERICAN_EXPRESS: "Amex",
  DISCOVER: "Discover",
  DINERS_CLUB: "Diners Club",
  SHOPIFY_PAY: "Shop Pay",
  SHOP_PAY: "Shop Pay",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
};

function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <span className="atelier-stars" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          fill={index < Math.round(rating) ? "#f59e0b" : "none"}
          className={index < Math.round(rating) ? "text-amber-500" : "text-slate-300"}
        />
      ))}
    </span>
  );
}

export function ProductDetails({
  product,
  recommendations,
  paymentSettings,
}: {
  product: ShopifyProduct;
  recommendations: ShopifyProduct[];
  paymentSettings: ShopifyPaymentSettings;
}) {
  const variants = product.variants.nodes;
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.options
        .filter((option) => option.values.length === 1)
        .map((option) => [option.name, option.values[0]]),
    ),
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [recommendationType, setRecommendationType] = useState("ALL");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { addLine, busy } = useCart();

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) =>
        variant.selectedOptions.every((option) => selectedOptions[option.name] === option.value),
      ) ?? null,
    [variants, selectedOptions],
  );

  const images = product.images.nodes.length ? product.images.nodes : product.featuredImage ? [product.featuredImage] : [];
  const visibleImage = selectedVariant?.image ?? images[activeImage] ?? product.featuredImage;
  const missingOption = product.options.some((option) => !selectedOptions[option.name] && option.values.length > 1);
  const purchasable = selectedVariant
    ? selectedVariant.availableForSale
    : !missingOption && variants.length === 1 && variants[0].availableForSale;

  const metafield = (key: string, namespace = "custom") =>
    product.metafields?.find((field) => field?.key === key && field.namespace === namespace)?.value;

  const materials = metafield("materials");
  const care = metafield("care");
  const fit = metafield("fit");
  const sizeOption = product.options.find((option) => /size/i.test(option.name));

  const reviewEntriesValue = metafield("review_entries");
  const reviewEntries = useMemo(() => parseReviewEntries(reviewEntriesValue), [reviewEntriesValue]);
  const entryRating = reviewEntries.reviews.length
    ? reviewEntries.reviews.reduce((total, review) => total + review.rating, 0) / reviewEntries.reviews.length
    : null;
  const shopifyReviewCount = parseReviewCount(metafield("rating_count", "reviews"));
  const reviewCount = shopifyReviewCount && shopifyReviewCount > 0 ? shopifyReviewCount : reviewEntries.reviews.length;
  const rating = parseRating(metafield("rating", "reviews")) ?? entryRating;
  const visibleReviews = showAllReviews ? reviewEntries.reviews : reviewEntries.reviews.slice(0, 3);

  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = selectedVariant?.compareAtPrice ?? product.compareAtPriceRange.minVariantPrice;
  const onSale = compareAt && Number(compareAt.amount) > Number(price.amount);
  const discountPercent = onSale
    ? Math.round(((Number(compareAt.amount) - Number(price.amount)) / Number(compareAt.amount)) * 100)
    : 0;

  const acceptedPayments = [...paymentSettings.acceptedCardBrands, ...paymentSettings.supportedDigitalWallets]
    .map((method) => paymentLabels[method])
    .filter((method, index, methods): method is string => Boolean(method) && methods.indexOf(method) === index);

  const recommendationTypes = Array.from(new Set(recommendations.map((item) => item.productType).filter(Boolean)));
  const visibleRecommendations =
    recommendationType === "ALL"
      ? recommendations
      : recommendations.filter((item) => item.productType === recommendationType);

  function isOptionValueAvailable(name: string, value: string) {
    return variants.some(
      (variant) =>
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
      window.setTimeout(() => setAdded(false), 2000);
    }
  }

  function setOption(name: string, value: string) {
    setSelectedOptions((current) => ({ ...current, [name]: value }));
    setActiveImage(0);
  }

  function changeImage(direction: number) {
    setActiveImage((current) => (current + direction + images.length) % images.length);
  }

  return (
    <>
      <main className="atelier-product-page">
        {/* Breadcrumb */}
        <nav className="atelier-product-breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-emerald-800">Home</Link>
          <span>/</span>
          {product.productType && (
            <>
              <Link href="/collections" className="hover:text-emerald-800">{product.productType}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-900 font-bold" aria-current="page">{product.title}</span>
        </nav>

        {/* Hero Section */}
        <section className="atelier-product-hero">
          {/* Gallery Column */}
          <div className="atelier-product-gallery">
            <div
              className="atelier-product-stage"
              onTouchStart={(event) => {
                event.currentTarget.dataset.touchStartX = String(event.touches[0]?.clientX ?? 0);
              }}
              onTouchEnd={(event) => {
                const start = Number(event.currentTarget.dataset.touchStartX ?? 0);
                const end = event.changedTouches[0]?.clientX;
                if (end !== undefined && Math.abs(end - start) > 55 && images.length > 1) {
                  changeImage(end < start ? 1 : -1);
                }
              }}
            >
              <div className="atelier-stage-edition">
                <span>ALPINE ATELIER</span>
                <span className="text-slate-400">•</span>
                <span>OKTOBERFEST 2026</span>
              </div>

              {visibleImage ? (
                <button
                  className="atelier-stage-image"
                  type="button"
                  onClick={() => setZoomed(true)}
                  aria-label={`Zoom in on ${product.title}`}
                >
                  <Image
                    src={imageUrl(visibleImage.url, 1500)}
                    alt={visibleImage.altText ?? product.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 55vw"
                  />
                </button>
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <Sparkles size={48} />
                </div>
              )}

              <div className="atelier-stage-footer">
                <span className="inline-flex items-center gap-1.5">
                  <ScanLine size={14} /> FRAME {String(activeImage + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </span>
                <span>CLICK TO ZOOM</span>
              </div>

              {images.length > 1 && (
                <div className="atelier-stage-arrows">
                  <button
                    type="button"
                    onClick={() => changeImage(-1)}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => changeImage(1)}
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="atelier-product-thumbnails" aria-label="Product thumbnails">
                {images.map((img, index) => (
                  <button
                    key={img.url}
                    className={index === activeImage ? "is-active" : ""}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={index === activeImage}
                  >
                    <Image
                      src={imageUrl(img.url, 220)}
                      alt={img.altText ?? `${product.title}, view ${index + 1}`}
                      width={80}
                      height={96}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Buy Box */}
          <div className="atelier-product-details">
            <div className="atelier-product-kicker">
              <span>{product.vendor || "ALPINE ATELIER BAVARIA"}</span>
              <span>•</span>
              <span>{product.productType || "HERITAGE COUTURE"}</span>
            </div>

            <header className="atelier-product-heading">
              <h1>{product.title}</h1>
              {reviewCount > 0 && (
                <a className="atelier-rating-link" href="#atelier-reviews">
                  {rating !== null && (
                    <>
                      <Stars rating={rating} size={15} />
                      <strong className="text-slate-900 font-bold ml-1">{rating.toFixed(1)}</strong>
                    </>
                  )}
                  <span>({reviewCount} reviews)</span>
                </a>
              )}
            </header>

            {/* Price Block */}
            <div className="atelier-product-price">
              <div>
                <p className="m-0 flex items-baseline gap-2">
                  <strong>{formatMoney(price)}</strong>
                  {onSale && (
                    <>
                      <del>{formatMoney(compareAt)}</del>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-xs">
                        SAVE {discountPercent}%
                      </span>
                    </>
                  )}
                </p>
              </div>
              <span className={`atelier-availability ${purchasable ? "is-available" : ""}`}>
                <i />
                {purchasable ? "IN STOCK & READY TO SHIP" : selectedVariant ? "SOLD OUT" : "CHOOSE SIZE"}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="atelier-product-description">
                <p className={storyExpanded ? "block" : "line-clamp-3"}>
                  {product.description}
                </p>
                {product.description.length > 200 && (
                  <button
                    type="button"
                    onClick={() => setStoryExpanded((expanded) => !expanded)}
                  >
                    {storyExpanded ? "SHOW LESS" : "READ FULL STORY"}
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Option / Variant Selectors */}
            <div className="atelier-product-options">
              {product.options.map((option) => {
                if (option.values.length === 1 && option.values[0] === "Default Title") return null;
                const current = selectedOptions[option.name];
                const isSize = /size/i.test(option.name);

                return (
                  <fieldset key={option.name} className="atelier-option-group">
                    <legend>
                      <span>{option.name}</span>
                      <span className="atelier-option-current">
                        <span>{current || "Select an option"}</span>
                        {isSize && (
                          <Link href="/pages/size-guide" className="inline-flex items-center gap-1">
                            <Ruler size={13} /> Size Guide
                          </Link>
                        )}
                      </span>
                    </legend>
                    <div className="atelier-option-values">
                      {option.values.map((value) => {
                        const available = isOptionValueAvailable(option.name, value);
                        return (
                          <button
                            key={value}
                            type="button"
                            className={`${current === value ? "is-selected" : ""} ${
                              !available ? "is-unavailable" : ""
                            }`}
                            onClick={() => setOption(option.name, value)}
                            aria-label={`${option.name}: ${value}${available ? "" : ", unavailable"}`}
                            aria-pressed={current === value}
                            disabled={!available}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </div>

            {/* Purchase CTA */}
            <div className="atelier-product-purchase">
              <div className="atelier-quantity" aria-label="Quantity">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus size={14} />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                className="atelier-add-button"
                type="button"
                disabled={!purchasable || busy}
                onClick={() => void addToBag()}
              >
                {added ? (
                  <>
                    <Check size={18} className="text-emerald-300" />
                    <span>ADDED TO YOUR BAG</span>
                  </>
                ) : busy ? (
                  <span>ADDING TO BAG…</span>
                ) : !purchasable ? (
                  <span>SELECT AN AVAILABLE SIZE</span>
                ) : (
                  <>
                    <span>ADD TO SHOPPING BAG</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Stock status statement */}
            <p className={`atelier-live-status ${purchasable ? "is-available" : ""}`}>
              <i />
              <span>
                {selectedVariant
                  ? `${selectedVariant.title} is ready for express courier dispatch.`
                  : "Please select size and color options above."}
              </span>
            </p>

            {/* Value Props Strip */}
            <div className="grid grid-cols-3 gap-3 my-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck size={18} className="text-emerald-700" />
                <span className="text-[11px] font-bold text-slate-800">2-3 Day Courier</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-slate-200">
                <ShieldCheck size={18} className="text-emerald-700" />
                <span className="text-[11px] font-bold text-slate-800">100% Authentic</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw size={18} className="text-emerald-700" />
                <span className="text-[11px] font-bold text-slate-800">30-Day Returns</span>
              </div>
            </div>

            {acceptedPayments.length > 0 && (
              <p className="atelier-payments">
                ACCEPTED PAYMENT METHODS: <span>{acceptedPayments.join(" • ")}</span>
              </p>
            )}
          </div>
        </section>

        {/* Specifications & Accordion Cards */}
        <div className="atelier-product-extras">
          <section className="atelier-record-section" aria-labelledby="atelier-record-title">
            <div className="atelier-record-intro">
              <span className="eyebrow">
                <i /> ATELIER ARCHIVE SPECIFICATION
              </span>
              <h2 id="atelier-record-title">
                The garment, <em>on record.</em>
              </h2>
              <p>Authentic craftsmanship specs logged for this edition.</p>
            </div>
            <dl className="atelier-record-grid">
              <div>
                <dt>MASTER ATELIER</dt>
                <dd>{product.vendor || "Alpine Atelier Bavaria"}</dd>
              </div>
              <div>
                <dt>CATEGORY</dt>
                <dd>{product.productType || "Trachten Couture"}</dd>
              </div>
              <div>
                <dt>STYLE CODE</dt>
                <dd>{selectedVariant?.sku || variants[0]?.sku || "AA-2026-FEST"}</dd>
              </div>
              <div>
                <dt>ORIGIN</dt>
                <dd>Bavaria, Germany</dd>
              </div>
            </dl>
          </section>

          <section className="atelier-materials-section" aria-labelledby="atelier-materials-title">
            <div className="atelier-materials-heading">
              <span className="eyebrow">
                <i /> MATERIALS &amp; CARE
              </span>
              <h2 id="atelier-materials-title">
                Natural fibers &amp; <em>longevity.</em>
              </h2>
            </div>
            <div className="atelier-materials-grid">
              <article>
                <span>01 / MATERIALS</span>
                <h3>Natural Composition</h3>
                <p>{materials || "Crafted using premium European leather, pure Bavarian wool, or fine jacquard silk."}</p>
              </article>
              <article>
                <span>02 / CARE</span>
                <h3>Garment Care</h3>
                <p>{care || "Specialist dry clean or gentle brush care. Leather items develop a natural, rich patina over time."}</p>
              </article>
            </div>
          </section>

          <section className="atelier-fit-section" aria-labelledby="atelier-fit-title">
            <div className="atelier-fit-intro">
              <span className="eyebrow">
                <i /> SIZING &amp; PROPORTION
              </span>
              <h2 id="atelier-fit-title">
                Find your <em>exact fit.</em>
              </h2>
              <p>{fit || "Standard European Bavarian sizing. Consult our measurement table or speak with our atelier stylists."}</p>
              <Link href="/pages/size-guide" className="atelier-fit-link">
                <span>OPEN COMPREHENSIVE SIZE GUIDE</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          <section className="atelier-delivery-section" aria-labelledby="atelier-delivery-title">
            <div className="atelier-delivery-heading">
              <span className="eyebrow">
                <i /> SHIPPING &amp; GUARANTEE
              </span>
              <h2 id="atelier-delivery-title">
                From Munich to <em>your door.</em>
              </h2>
            </div>
            <div className="atelier-delivery-grid">
              <article>
                <span className="atelier-delivery-icon">
                  <Truck size={18} />
                </span>
                <div>
                  <h3>Express Courier Delivery</h3>
                  <p>All items dispatched via tracked DHL Express or FedEx directly to your address.</p>
                  <Link href="/policies/shipping-policy">
                    <span>Shipping Policy</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </article>
              <article>
                <span className="atelier-delivery-icon">
                  <RotateCcw size={18} />
                </span>
                <div>
                  <h3>30-Day Exchange &amp; Returns</h3>
                  <p>Try your pieces comfortably at home with seamless exchanges.</p>
                  <Link href="/policies/refund-policy">
                    <span>Returns Policy</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </article>
            </div>
          </section>
        </div>

        {/* Customer Reviews Section */}
        <section className="atelier-reviews" id="atelier-reviews" aria-labelledby="atelier-reviews-title">
          <div className="atelier-lower-heading">
            <div>
              <span className="eyebrow">
                <i /> CLIENT NOTES &amp; MEMORIES
              </span>
              <h2 id="atelier-reviews-title">
                Worn, loved &amp; <em>celebrated.</em>
              </h2>
            </div>
            <span className="atelier-lower-count">
              {reviewCount} {reviewCount === 1 ? "REVIEW" : "VERIFIED REVIEWS"}
            </span>
          </div>

          {reviewCount > 0 && rating !== null && (
            <div className="atelier-review-summary">
              <Stars rating={rating} size={18} />
              <strong>{rating.toFixed(1)}</strong>
              <span className="text-slate-500 font-medium text-xs">AVERAGE CLIENT RATING</span>
            </div>
          )}

          {visibleReviews.length > 0 ? (
            <div className="atelier-review-grid">
              {visibleReviews.map((review) => (
                <article key={review.id} className="atelier-review-card">
                  <Stars rating={review.rating} size={14} />
                  {review.title && <h3>{review.title}</h3>}
                  <p>{review.body}</p>
                  <footer>
                    <span>{review.author}</span>
                    {review.date && <time dateTime={review.date}>{review.date}</time>}
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              {reviewCount > 0
                ? "Rating available from verified Shopify store purchases."
                : "No customer reviews have been published for this piece yet."}
            </p>
          )}

          {reviewEntries.reviews.length > 3 && (
            <button
              className="atelier-show-reviews"
              type="button"
              onClick={() => setShowAllReviews((show) => !show)}
            >
              <span>{showAllReviews ? "SHOW FEWER REVIEWS" : `VIEW ALL ${reviewEntries.reviews.length} REVIEWS`}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </section>

        {/* Recommendations Grid */}
        {recommendations.length > 0 && (
          <section className="atelier-recommendations section" aria-labelledby="atelier-recommendations-title">
            <div className="atelier-lower-heading">
              <div>
                <span className="eyebrow">
                  <i /> COMPLETE YOUR LOOK
                </span>
                <h2 id="atelier-recommendations-title">
                  Recommended by <em>the atelier.</em>
                </h2>
              </div>
              <span className="atelier-lower-count">
                {visibleRecommendations.length} PIECES
              </span>
            </div>

            {recommendationTypes.length > 1 && (
              <div className="atelier-recommendation-filters" role="group">
                <button
                  type="button"
                  className={recommendationType === "ALL" ? "is-active" : ""}
                  onClick={() => setRecommendationType("ALL")}
                >
                  ALL
                </button>
                {recommendationTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={recommendationType === type ? "is-active" : ""}
                    onClick={() => setRecommendationType(type)}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            <div className="product-grid">
              {visibleRecommendations.slice(0, 4).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}

        <RecentlyViewedProducts currentHandle={product.handle} />
      </main>

      {/* Lightbox Zoom Modal */}
      {zoomed && visibleImage && (
        <div
          className="atelier-image-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Product image zoom"
          onClick={() => setZoomed(false)}
        >
          <button type="button" aria-label="Close zoom modal">
            <X size={22} />
          </button>
          <Image
            src={imageUrl(visibleImage.url, 1800)}
            alt={visibleImage.altText ?? product.title}
            fill
            sizes="100vw"
            priority
          />
        </div>
      )}
    </>
  );
}
