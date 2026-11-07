"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, ScanLine, ShieldCheck, Star, Truck, X } from "lucide-react";
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
    // Shopify rating metafields can also contain a plain number.
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

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="atelier-stars" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={size} fill={index < Math.round(rating) ? "currentColor" : "none"} />
      ))}
    </span>
  );
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
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [recommendationType, setRecommendationType] = useState("ALL");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { addLine, busy } = useCart();

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.selectedOptions.every((option) => selectedOptions[option.name] === option.value)) ?? null,
    [variants, selectedOptions],
  );
  const images = product.images.nodes.length ? product.images.nodes : product.featuredImage ? [product.featuredImage] : [];
  const visibleImage = selectedVariant?.image ?? images[activeImage] ?? product.featuredImage;
  const missingOption = product.options.some((option) => !selectedOptions[option.name] && option.values.length > 1);
  const purchasable = selectedVariant ? selectedVariant.availableForSale : !missingOption && variants.length === 1 && variants[0].availableForSale;
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
  const acceptedPayments = [...paymentSettings.acceptedCardBrands, ...paymentSettings.supportedDigitalWallets]
    .map((method) => paymentLabels[method])
    .filter((method, index, methods): method is string => Boolean(method) && methods.indexOf(method) === index);
  const recommendationTypes = Array.from(new Set(recommendations.map((item) => item.productType).filter(Boolean)));
  const visibleRecommendations = recommendationType === "ALL"
    ? recommendations
    : recommendations.filter((item) => item.productType === recommendationType);

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

  function changeImage(direction: number) {
    setActiveImage((current) => (current + direction + images.length) % images.length);
  }

  return (
    <>
      <main className="atelier-product-page">
        <nav className="atelier-product-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span>
          {product.productType && <><Link href="/collections">{product.productType}</Link><span>/</span></>}
          <span aria-current="page">{product.title}</span>
        </nav>

        <section className="atelier-product-hero">
          <div className="atelier-product-gallery">
            <div className="atelier-product-stage" onTouchStart={(event) => {
              event.currentTarget.dataset.touchStartX = String(event.touches[0]?.clientX ?? 0);
            }} onTouchEnd={(event) => {
              const start = Number(event.currentTarget.dataset.touchStartX ?? 0);
              const end = event.changedTouches[0]?.clientX;
              if (end !== undefined && Math.abs(end - start) > 55 && images.length > 1) changeImage(end < start ? 1 : -1);
            }}>
              <div className="atelier-stage-edition"><span>ALPINE ATELIER</span><i /> OBJECT NO. 01</div>
              {visibleImage ? (
                <button className="atelier-stage-image" type="button" onClick={() => setZoomed(true)} aria-label={`Zoom in on ${product.title}`}>
                  <Image src={imageUrl(visibleImage.url, 1500)} alt={visibleImage.altText ?? product.title} fill priority sizes="(max-width: 760px) 100vw, 58vw" />
                </button>
              ) : <div className="atelier-stage-placeholder" aria-label="Product image unavailable" />}
              <div className="atelier-stage-footer">
                <span><ScanLine size={14} /> FRAME {String(activeImage + 1).padStart(2, "0")} <i /> {String(images.length).padStart(2, "0")}</span>
                <span>SELECT IMAGE TO EXPLORE</span>
              </div>
              {images.length > 1 && (
                <div className="atelier-stage-arrows">
                  <button type="button" onClick={() => changeImage(-1)} aria-label="Previous product image"><ChevronLeft size={17} /></button>
                  <button type="button" onClick={() => changeImage(1)} aria-label="Next product image"><ChevronRight size={17} /></button>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="atelier-product-thumbnails" aria-label="Product images">
                {images.map((image, index) => (
                  <button key={image.url} className={index === activeImage ? "is-active" : ""} type="button" onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}`} aria-pressed={index === activeImage}>
                    <Image src={imageUrl(image.url, 220)} alt={image.altText ?? `${product.title}, view ${index + 1}`} width={84} height={108} />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="atelier-product-details">
            <div className="atelier-product-kicker">
              <span>{product.vendor || "ALPINE ATELIER"}</span>
              <span>{product.productType || "THE COLLECTION"}</span>
            </div>
            <header className="atelier-product-heading">
              <h1>{product.title}</h1>
              {reviewCount > 0 && (
                <a className="atelier-rating-link" href="#atelier-reviews" aria-label={`Read ${reviewCount} customer ${reviewCount === 1 ? "review" : "reviews"}${rating !== null ? `, rated ${rating.toFixed(1)} out of 5` : ""}`}>
                  {rating !== null && <><Stars rating={rating} size={13} /><strong>{rating.toFixed(1)}</strong></>}
                  <span>{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span><ArrowRight size={13} />
                </a>
              )}
            </header>

            <div className="atelier-product-price">
              <div>
                <span className="atelier-overline">THE PRICE</span>
                <p><strong>{formatMoney(price)}</strong>{onSale && <del>{formatMoney(compareAt)}</del>}</p>
              </div>
              <span className={`atelier-availability ${purchasable ? "is-available" : ""}`}>
                <i />{purchasable ? "AVAILABLE" : selectedVariant ? "SOLD OUT" : "CHOOSE OPTIONS"}
              </span>
            </div>

            {product.description && (
              <div className={`atelier-product-description ${storyExpanded ? "is-expanded" : ""}`}>
                <p>{product.description}</p>
                {product.description.length > 240 && (
                  <button type="button" onClick={() => setStoryExpanded((expanded) => !expanded)}>
                    {storyExpanded ? "LESS ABOUT THIS PIECE" : "READ THE FULL STORY"} <ArrowRight size={13} />
                  </button>
                )}
              </div>
            )}

            <div className="atelier-product-options" id="atelier-options">
              <div className="atelier-section-heading"><span>01</span><h2>Make it yours</h2></div>
              {product.options.map((option) => {
                if (option.values.length === 1 && option.values[0] === "Default Title") return null;
                const current = selectedOptions[option.name];
                return (
                  <fieldset key={option.name} className="atelier-option-group">
                    <legend>
                      <span>{option.name}</span>
                      <span className="atelier-option-current">{current || "Choose"}{/size/i.test(option.name) && <Link href="/pages/size-guide">Size guide</Link>}</span>
                    </legend>
                    <div className="atelier-option-values">
                      {option.values.map((value) => {
                        const available = isOptionValueAvailable(option.name, value);
                        return (
                          <button key={value} type="button" className={`${current === value ? "is-selected" : ""} ${!available ? "is-unavailable" : ""}`} onClick={() => setOption(option.name, value)} aria-label={`${option.name}: ${value}${available ? "" : ", unavailable"}`} aria-pressed={current === value} disabled={!available}>
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <div className="atelier-product-purchase">
              <div className="atelier-quantity" aria-label="Quantity">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button>
                <span>{quantity}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></button>
              </div>
              <button className="atelier-add-button" type="button" disabled={!purchasable || busy} onClick={() => void addToBag()}>
                {added ? <>ADDED TO YOUR BAG <Check size={16} /></> : busy ? "ADDING…" : !purchasable ? "SELECT AN AVAILABLE OPTION" : <>ADD TO BAG <ArrowRight size={16} /></>}
              </button>
            </div>
            <p className={`atelier-live-status ${purchasable ? "is-available" : ""}`}>
              <i />{selectedVariant ? `${selectedVariant.title} ${purchasable ? "is ready to add to your bag." : "is currently unavailable."}` : "Choose an option to check availability."}
            </p>
            {acceptedPayments.length > 0 && <p className="atelier-payments">ACCEPTED PAYMENT <span>{acceptedPayments.join(" · ")}</span></p>}
          </div>
        </section>

        <div className="atelier-product-extras">
        <section className="atelier-record-section" aria-labelledby="atelier-record-title">
          <div className="atelier-record-intro">
            <span className="atelier-overline">THE ALPINE ATELIER / ARCHIVE</span>
            <h2 id="atelier-record-title">The piece,<br /><em>on record.</em></h2>
            <p>A closer look at the details listed for this piece.</p>
          </div>
          <dl className="atelier-record-grid">
            <div><dt><span>01</span>MAKER</dt><dd>{product.vendor || "Not specified"}</dd></div>
            <div><dt><span>02</span>CATEGORY</dt><dd>{product.productType || "Not specified"}</dd></div>
            <div><dt><span>03</span>STYLE CODE</dt><dd>{selectedVariant?.sku || variants[0]?.sku || "Not specified"}</dd></div>
            <div><dt><span>04</span>OPTIONS</dt><dd>{product.options.length ? product.options.map((option) => option.name).join(" · ") : "Standard"}</dd></div>
          </dl>
        </section>

        <section className="atelier-materials-section" aria-labelledby="atelier-materials-title">
          <div className="atelier-materials-heading">
            <span className="atelier-overline">CONSIDERED, DOWN TO THE DETAILS</span>
            <h2 id="atelier-materials-title">Materials &<br /><em>care.</em></h2>
            <p>Information from this piece&apos;s product listing.</p>
          </div>
          <div className="atelier-materials-grid">
            <article><span>01 / MATERIALS</span><h3>What it&apos;s made of</h3><p>{materials || "Materials details have not been added to the product listing yet."}</p></article>
            <article><span>02 / CARE</span><h3>How to care for it</h3><p>{care || "Care instructions have not been added to the product listing yet."}</p></article>
          </div>
        </section>

        <section className="atelier-fit-section" aria-labelledby="atelier-fit-title">
          <div className="atelier-fit-intro">
            <span className="atelier-overline">A MORE PERSONAL FIT</span>
            <h2 id="atelier-fit-title">Find your<br /><em>measure.</em></h2>
            <p>{fit || "Choose from the available options for this piece. Availability updates with your selection."}</p>
            <Link href="/pages/size-guide" className="atelier-fit-link">OPEN THE SIZE GUIDE <ArrowRight size={14} /></Link>
          </div>
          <div className="atelier-fit-selector">
            <div className="atelier-fit-selector-heading"><span>{sizeOption?.name ?? "YOUR OPTIONS"}</span><span>{sizeOption ? selectedOptions[sizeOption.name] || "CHOOSE A SIZE" : "LIVE AVAILABILITY"}</span></div>
            {sizeOption ? (
              <div className="atelier-fit-values">
                {sizeOption.values.map((value) => {
                  const available = isOptionValueAvailable(sizeOption.name, value);
                  const selected = selectedOptions[sizeOption.name] === value;
                  return (
                    <button key={value} type="button" className={`${selected ? "is-selected" : ""} ${available ? "" : "is-unavailable"}`} aria-label={`${value}, ${available ? "available" : "unavailable"}`} aria-pressed={selected} disabled={!available} onClick={() => setOption(sizeOption.name, value)}>
                      <span>{value}</span><small>{available ? "AVAILABLE" : "SOLD OUT"}</small>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="atelier-fit-no-size"><span><Check size={17} /> {purchasable ? "This piece is available in its listed configuration." : "Select an available configuration above."}</span></div>
            )}
          </div>
        </section>

        <section className="atelier-delivery-section" aria-labelledby="atelier-delivery-title">
          <div className="atelier-delivery-heading">
            <span className="atelier-overline">A LITTLE MORE PEACE OF MIND</span>
            <h2 id="atelier-delivery-title">From our atelier<br />to <em>your door.</em></h2>
            <p>Clear details for every step after you choose your piece.</p>
          </div>
          <div className="atelier-delivery-grid">
            <article><span className="atelier-delivery-icon"><Truck size={19} /></span><div><h3>Delivery</h3><p>Current shipping options, rates and delivery estimates are shown at checkout.</p><Link href="/policies/shipping-policy">SHIPPING POLICY <ArrowRight size={13} /></Link></div></article>
            <article><span className="atelier-delivery-icon"><RotateCcw size={19} /></span><div><h3>Returns</h3><p>Review the store&apos;s return policy before placing your order.</p><Link href="/policies/refund-policy">RETURNS POLICY <ArrowRight size={13} /></Link></div></article>
            <article><span className="atelier-delivery-icon"><ShieldCheck size={19} /></span><div><h3>Secure checkout</h3><p>Payment and order completion are handled securely by Shopify.</p><span className="atelier-checkout-note">SHOPIFY SECURE CHECKOUT</span></div></article>
          </div>
        </section>
        </div>

        <section className="atelier-reviews" id="atelier-reviews" aria-labelledby="atelier-reviews-title">
          <div className="atelier-lower-heading">
            <div><span className="atelier-overline">NOTES FROM THE COMMUNITY</span><h2 id="atelier-reviews-title">Worn & <em>remembered.</em></h2></div>
            <span className="atelier-lower-count">{String(reviewCount).padStart(2, "0")} {reviewCount === 1 ? "REVIEW" : "REVIEWS"}</span>
          </div>
          {reviewCount > 0 && rating !== null && <div className="atelier-review-summary"><Stars rating={rating} size={17} /><strong>{rating.toFixed(1)} <span>/ 5</span></strong><span>AVERAGE RATING</span></div>}
          {reviewEntries.invalid && <p className="atelier-review-warning" role="status">Some reviews could not be displayed. Check the Shopify <code>custom.review_entries</code> metafield format.</p>}
          {visibleReviews.length > 0 ? (
            <div className="atelier-review-grid">
              {visibleReviews.map((review) => (
                <article key={review.id} className="atelier-review-card">
                  <Stars rating={review.rating} size={13} />
                  {review.title && <h3>{review.title}</h3>}
                  <p>{review.body}</p>
                  <footer><span>{review.author}</span>{review.date && <time dateTime={review.date}>{review.date}</time>}</footer>
                </article>
              ))}
            </div>
          ) : <p className="atelier-review-empty">{reviewCount > 0 ? "A Shopify rating is available, but written review details aren’t published for this piece." : "No customer notes have been published for this piece yet."}</p>}
          {reviewEntries.reviews.length > 3 && (
            <button className="atelier-show-reviews" type="button" onClick={() => setShowAllReviews((show) => !show)}>
              {showAllReviews ? "SHOW FEWER" : `SHOW ALL ${reviewEntries.reviews.length} REVIEWS`} <ArrowRight size={14} />
            </button>
          )}
        </section>

        {recommendations.length > 0 && (
          <section className="atelier-recommendations section" aria-labelledby="atelier-recommendations-title">
            <div className="atelier-lower-heading">
              <div><span className="atelier-overline">A FEW MORE GOOD THINGS</span><h2 id="atelier-recommendations-title">The <em>edit.</em></h2><p>More pieces selected from the live collection.</p></div>
              <span className="atelier-lower-count">{String(visibleRecommendations.length).padStart(2, "0")} / {String(recommendations.length).padStart(2, "0")}</span>
            </div>
            {recommendationTypes.length > 1 && (
              <div className="atelier-recommendation-filters" role="group" aria-label="Filter recommendations by product type">
                <button type="button" className={recommendationType === "ALL" ? "is-active" : ""} aria-pressed={recommendationType === "ALL"} onClick={() => setRecommendationType("ALL")}>ALL</button>
                {recommendationTypes.map((type) => <button key={type} type="button" className={recommendationType === type ? "is-active" : ""} aria-pressed={recommendationType === type} onClick={() => setRecommendationType(type)}>{type.toUpperCase()}</button>)}
              </div>
            )}
            {visibleRecommendations.length > 0
              ? <div className="product-grid">{visibleRecommendations.slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}</div>
              : <p className="atelier-review-empty">No pieces in this category just yet. Try another edit.</p>}
          </section>
        )}
        <RecentlyViewedProducts currentHandle={product.handle} />
      </main>

      {zoomed && visibleImage && (
        <div className="atelier-image-modal" role="dialog" aria-modal="true" aria-label="Product image zoom" onClick={() => setZoomed(false)}>
          <button type="button" aria-label="Close image zoom"><X size={20} /></button>
          <Image src={imageUrl(visibleImage.url, 1800)} alt={visibleImage.altText ?? product.title} fill sizes="100vw" priority />
        </div>
      )}
    </>
  );
}
