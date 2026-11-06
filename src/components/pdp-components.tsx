"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import * as Accordion from "@radix-ui/react-accordion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Maximize2, Minus, Plus, Ruler, ShieldCheck, Star, Truck, X } from "lucide-react";
import { addToCartAction } from "@/actions/cart";
import { formatMoney, discountPercent } from "@/lib/format";
import { firstAvailableVariant, productBenefits, resolveVariant, selectionFromVariant } from "@/lib/products/variants";
import type { Product, ShopifyImage } from "@/lib/shopify/types";
import { trackStorefrontEvent } from "@/lib/analytics";
import { faqItems } from "@/lib/products/faqs";

export function ProductGallery({ product }: { product: Product }) {
  const images = product.images.nodes.length ? product.images.nodes : product.featuredImage ? [product.featuredImage] : [];
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const image = images[active];

  function move(direction: number) {
    setActive((current) => (current + direction + images.length) % images.length);
  }
  if (!image) return <div className="gallery-empty lozenge" role="img" aria-label={`${product.title} image unavailable`} />;
  return (
    <div className="gallery">
      <div className="gallery-thumbs" role="tablist" aria-label="Product images">
        {images.map((item, index) => (
          <button type="button" role="tab" aria-selected={active === index} aria-label={`View image ${index + 1}`} key={item.url} onClick={() => setActive(index)}>
            <Image src={item.url} alt="" fill sizes="68px" />
          </button>
        ))}
      </div>
      <div className="gallery-main" tabIndex={0} aria-label={`${product.title} image gallery`} aria-roledescription="carousel" onKeyDown={(event) => {
        if (event.key === "ArrowRight") move(1);
        if (event.key === "ArrowLeft") move(-1);
      }}>
        <Image src={image.url} alt={image.altText ?? product.title} fill priority={active === 0} sizes="(max-width: 800px) 100vw, 58vw" />
        {(() => {
          const firstVariant = product.variants.nodes[0];
          const sale = firstVariant ? discountPercent(firstVariant.price, firstVariant.compareAtPrice) : null;
          return sale !== null ? <span className="gallery-tag">Save {sale}%</span> : null;
        })()}
        {images.length > 1 && <div className="gallery-arrows"><button type="button" aria-label="Previous product image" onClick={() => move(-1)}><ArrowLeft size={17} /></button><button type="button" aria-label="Next product image" onClick={() => move(1)}><ArrowRight size={17} /></button></div>}
        <button type="button" className="gallery-zoom" onClick={() => setZoomOpen(true)} aria-label="Zoom product image"><Maximize2 size={17} /></button>
        <span className="gallery-count" aria-live="polite">{active + 1} / {images.length}</span>
      </div>
      <Dialog.Root open={zoomOpen} onOpenChange={setZoomOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="lightbox-overlay" />
          <Dialog.Content className="lightbox">
            <div className="lightbox-bar"><Dialog.Title>{image.altText ?? product.title}</Dialog.Title><Dialog.Close className="lightbox-close" aria-label="Close image zoom"><X size={20} /></Dialog.Close></div>
            <div className="lightbox-image"><Image src={image.url} alt={image.altText ?? product.title} fill sizes="95vw" /></div>
            {images.length > 1 && <div className="lightbox-controls"><button type="button" onClick={() => move(-1)} aria-label="Previous image"><ArrowLeft /></button><span>{active + 1} of {images.length}</span><button type="button" onClick={() => move(1)} aria-label="Next image"><ArrowRight /></button></div>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <style>{`
        .gallery { display:grid; grid-template-columns:68px minmax(0,1fr); gap:.8rem; align-self:start; position:sticky; top:105px; }
        .gallery-thumbs { display:flex; max-height:min(700px,calc(100vh - 130px)); flex-direction:column; gap:.65rem; overflow:auto; }
        .gallery-thumbs button { position:relative; flex:0 0 78px; overflow:hidden; border:1px solid transparent; border-radius:8px; background:#e9e3d6; cursor:pointer; }
        .gallery-thumbs button[aria-selected="true"] { border-color:var(--hops); outline:1px dashed var(--pretzel); outline-offset:2px; }
        .gallery-thumbs img { object-fit:cover; }
        .gallery-main { position:relative; min-height:560px; overflow:hidden; border-radius:14px; background:#ebe5d8; }
        .gallery-main> img { object-fit:cover; }
        .gallery-tag { position:absolute; top:1rem; left:1rem; padding:.55rem .75rem; background:var(--gold); font-size:.65rem; font-weight:800; letter-spacing:.09em; text-transform:uppercase; }
        .gallery-arrows { position:absolute; top:50%; right:1rem; left:1rem; display:flex; justify-content:space-between; transform:translateY(-50%); }
        .gallery-arrows button,.gallery-zoom { display:grid; width:42px; height:42px; place-items:center; border:0; border-radius:50%; background:rgba(246,240,228,.9); cursor:pointer; }
        .gallery-zoom { position:absolute; right:1rem; bottom:1rem; }.gallery-count { position:absolute; bottom:1rem; left:1rem; border-radius:20px; padding:.45rem .65rem; background:rgba(20,33,26,.76); color:white; font-size:.63rem; }
        .gallery-empty { min-height:400px; border-radius:14px; }
        .lightbox-overlay { position:fixed; z-index:90; inset:0; background:rgba(14,22,17,.92); }
        .lightbox { position:fixed; z-index:91; inset:3vh 3vw; display:flex; flex-direction:column; outline:none; }
        .lightbox-bar { display:flex; min-height:52px; align-items:center; justify-content:space-between; color:white; }.lightbox-bar h2 { font-family:var(--font-ui); font-size:.78rem; font-weight:500; }
        .lightbox-close,.lightbox-controls button { display:grid; width:42px; height:42px; place-items:center; border:1px solid rgba(255,255,255,.55); border-radius:50%; background:transparent; color:white; cursor:pointer; }
        .lightbox-image { position:relative; flex:1; min-height:0; overflow:auto; }.lightbox-image img { object-fit:contain; touch-action:pan-x pan-y pinch-zoom; }
        .lightbox-controls { display:flex; min-height:55px; align-items:center; justify-content:center; gap:1.5rem; color:white; font-size:.75rem; }
        .gallery .lightbox-image img { user-select:none; }
        @media(max-width:800px) { .gallery { position:relative; top:auto; grid-template-columns:1fr; }.gallery-thumbs { grid-row:2; max-height:none; flex-direction:row; }.gallery-thumbs button { flex-basis:65px; height:78px; }.gallery-main { min-height:clamp(390px,115vw,600px); } }
      `}</style>
    </div>
  );
}

export function OptionSelectors({
  product,
  gifts = [],
  ctaLabel,
}: {
  product: Product;
  gifts?: { product: Product; variantId: string; value: string }[];
  ctaLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const variants = product.variants.nodes;
  const initial = firstAvailableVariant(variants);
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const fromVariant = selectionFromVariant(initial);
    for (const option of product.options) {
      const param = option.name.toLowerCase().includes("leather") ? "leather" : option.name.toLowerCase().includes("size") ? "size" : null;
      const value = param ? searchParams.get(param) : null;
      if (value) {
        const found = option.values.find((item) => item.toLowerCase() === value.toLowerCase());
        if (found) fromVariant[option.name] = found;
      }
    }
    return fromVariant;
  });
  const [quantity, setQuantity] = useState(1);
  const [measurementsOpen, setMeasurementsOpen] = useState(false);
  const [measurements, setMeasurements] = useState({ waist: "", hip: "", thigh: "", length: "", height: "" });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const ctaRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const selectedVariant = useMemo(() => resolveVariant(variants, selection), [selection, variants]);
  const stock = selectedVariant?.quantityAvailable ?? null;
  const leatherName = Object.entries(selection).find(([name]) => name.toLowerCase().includes("leather"))?.[1] ?? "Cow";

  useEffect(() => {
    trackStorefrontEvent("view_item", {
      currency: initial?.price.currencyCode,
      value: initial ? Number(initial.price.amount) : undefined,
      items: [{ item_id: initial?.id, item_name: product.title, item_variant: initial?.title }],
    });
  }, [initial, initial?.id, initial?.price.amount, initial?.price.currencyCode, initial?.title, product.title]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const leather = Object.entries(selection).find(([name]) => name.toLowerCase().includes("leather"))?.[1];
    const size = Object.entries(selection).find(([name]) => name.toLowerCase().includes("size"))?.[1];
    if (leather) params.set("leather", leather.toLowerCase()); else params.delete("leather");
    if (size) params.set("size", size.toLowerCase()); else params.delete("size");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selection, pathname, router, searchParams]);

  useEffect(() => {
    const element = ctaRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry!.isIntersecting), { threshold: .2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function setOption(name: string, value: string) {
    setSelection((current) => ({ ...current, [name]: value }));
    trackStorefrontEvent("select_item", { item_id: product.id, option: name, value });
    setError("");
    setSuccess("");
  }

  function addToBag() {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        const bundleId = gifts.length ? crypto.randomUUID() : "";
        const attributes = [
          ...Object.entries(selection).map(([key, value]) => ({ key, value })),
          ...(bundleId ? [{ key: "_gift_bundle", value: bundleId }] : []),
          ...Object.entries(measurements).filter(([, value]) => value.trim()).map(([key, value]) => ({ key: `Measurement: ${key}`, value: `${value} cm` })),
        ];
        const lines = [
          { merchandiseId: selectedVariant.id, quantity, attributes },
          ...gifts.map((gift) => ({
            merchandiseId: gift.variantId,
            quantity: 1,
            attributes: [{ key: "_gift", value: "true" }, { key: "_gift_bundle", value: bundleId }, { key: "Gift for", value: product.title }],
          })),
        ];
        const cart = await addToCartAction(lines);
        window.dispatchEvent(new CustomEvent("wiesn:open-cart", { detail: cart }));
        window.dispatchEvent(new CustomEvent("wiesn:cart-updated", { detail: cart }));
        setSuccess("Added to your bag. Prost!");
        trackStorefrontEvent("add_to_cart", {
          currency: selectedVariant.price.currencyCode,
          value: Number(selectedVariant.price.amount) * quantity,
          items: [{ item_id: selectedVariant.id, item_name: product.title, item_variant: selectedVariant.title, quantity, leather: leatherName, size: Object.entries(selection).find(([name]) => name.toLowerCase().includes("size"))?.[1], gift: gifts.length > 0 }],
        });
        if (Object.values(measurements).some((value) => value.trim())) {
          trackStorefrontEvent("measurement_saved", { item_id: selectedVariant.id, measurements });
        }
        if (sessionStorage.getItem("wiesn-prost-shown") !== "true") {
          sessionStorage.setItem("wiesn-prost-shown", "true");
          setSuccess("Prost! Your piece is in the bag.");
        }
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "The item could not be added.");
      }
    });
  }

  const selectedOptionsLabel = Object.values(selection).join(" · ");
  const enabled = Boolean(selectedVariant?.availableForSale);
  const maxQuantity = stock && stock > 0 ? Math.min(stock, 99) : 99;

  return (
    <>
      <div className="option-selectors">
        {product.options.map((option) => (
          <fieldset className="option-group" key={option.id}>
            <legend>{option.name}<span>{selection[option.name]}</span>{option.name.toLowerCase().includes("size") && <button className="size-chart-link" type="button" onClick={() => { trackStorefrontEvent("size_chart_open", { item_id: product.id }); window.dispatchEvent(new Event("wiesn:open-size-chart")); }}><Ruler size={14} /> Size chart</button>}</legend>
            <div className={option.name.toLowerCase().includes("leather") ? "leather-options" : "size-options"} role="radiogroup" aria-label={option.name}>
              {option.values.map((value) => {
                const matching = variants.filter((variant) => variant.selectedOptions.every((selected) => selected.name === option.name ? selected.value === value : selection[selected.name] === undefined || selection[selected.name] === selected.value));
                const available = matching.some((variant) => variant.availableForSale);
                const color = value.toLowerCase().includes("cow") ? "#7a4a25" : value.toLowerCase().includes("goat") ? "#e0a526" : value.toLowerCase().includes("deer") ? "#59453a" : undefined;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selection[option.name] === value}
                    aria-disabled={!available}
                    tabIndex={selection[option.name] === value ? 0 : -1}
                    className={`${selection[option.name] === value ? "selected" : ""} ${!available ? "unavailable" : ""}`}
                    onClick={() => available && setOption(option.name, value)}
                    onKeyDown={(event) => {
                      if (event.key !== "ArrowRight" && event.key !== "ArrowDown" && event.key !== "ArrowLeft" && event.key !== "ArrowUp") return;
                      event.preventDefault();
                      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
                      const buttons = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)') ?? []);
                      const currentIndex = buttons.indexOf(event.currentTarget);
                      const next = buttons[(currentIndex + direction + buttons.length) % buttons.length];
                      next?.focus();
                      const nextValue = next?.querySelector("span")?.textContent;
                      if (nextValue) setOption(option.name, nextValue);
                    }}
                    disabled={!available}
                    style={color ? { ["--leather" as string]: color } : undefined}
                  >
                    {option.name.toLowerCase().includes("leather") && <i aria-hidden="true" />}
                    <span>{value}</span>
                  </button>
                );
              })}
            </div>
            {option.name.toLowerCase().includes("size") && <p className="size-hint">Between sizes? We recommend sizing up.</p>}
          </fieldset>
        ))}
        <div className="live-price" aria-live="polite">
          <strong>{selectedVariant ? formatMoney(selectedVariant.price) : "Choose available options"}</strong>
          {selectedVariant?.compareAtPrice && <del>{formatMoney(selectedVariant.compareAtPrice)}</del>}
          {selectedVariant && discountPercent(selectedVariant.price, selectedVariant.compareAtPrice) !== null && <span>Save {discountPercent(selectedVariant.price, selectedVariant.compareAtPrice)}%</span>}
        </div>
        {!selectedVariant && <p className="variant-error" role="status">That combination is unavailable. Choose another option or <a href="mailto:servus@wiesnatelier.com">ask us to notify you</a>.</p>}
        {stock !== null && stock > 0 && stock <= 5 && <p className="stock-note" aria-live="polite">Only {stock} left in this size.</p>}
        <div className="quantity-row">
          <label htmlFor="pdp-quantity">Quantity</label>
          <div className="quantity-control"><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button><input id="pdp-quantity" value={quantity} inputMode="numeric" aria-label="Quantity" onChange={(event) => setQuantity(Math.max(1, Math.min(maxQuantity, Number(event.target.value) || 1)))} /><button type="button" aria-label="Increase quantity" disabled={quantity >= maxQuantity} onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}><Plus size={15} /></button></div>
        </div>
        <details className="measurements">
          <summary onClick={(event) => { event.preventDefault(); setMeasurementsOpen((value) => !value); }}>{measurementsOpen ? "Close exact measurements" : "Enter exact measurements (optional)"} <span>{measurementsOpen ? "−" : "+"}</span></summary>
          {measurementsOpen && <div className="measurements-grid">{Object.entries(measurements).map(([name, value]) => <label key={name}>{name}<input className="field" type="number" min="1" max="300" step="0.1" value={value} onChange={(event) => setMeasurements((current) => ({ ...current, [name]: event.target.value }))} placeholder="cm" /></label>)}<p>Your measurements are saved with this order. We&apos;ll confirm your size by email before dispatch.</p></div>}
        </details>
        <div ref={ctaRef} className="cta-area">
          <button className="button-primary add-button" type="button" disabled={!enabled || pending} onClick={addToBag}>{pending ? "Adding to your bag…" : ctaLabel || (gifts.length ? "Claim your free gift — add to bag" : "Add to bag")} <ArrowRight size={17} /></button>
          <p aria-live="polite" className={error ? "feedback error" : "feedback"}>{error || success}</p>
        </div>
        <div className="payment-icons" aria-label="Accepted payment methods">{["AMEX", "Apple Pay", "Discover", "Google Pay", "JCB", "Maestro", "Mastercard", "Shop Pay", "Union Pay", "Visa"].map((item) => <span key={item}>{item}</span>)}</div>
      </div>
      {stickyVisible && <div className="sticky-atc"><span>{product.title}<small>{selectedOptionsLabel}</small></span><strong>{selectedVariant ? formatMoney(selectedVariant.price) : "Choose options"}</strong><button className="button-primary" type="button" disabled={!enabled || pending} onClick={addToBag}>{pending ? "Adding…" : "Add to bag"}</button></div>}
      <style>{`
        .option-selectors { display:grid; gap:1.2rem; }
        .live-price { display:flex; align-items:center; gap:.65rem; }.live-price strong { font-size:1.1rem; }.live-price del { color:var(--muted); font-size:.78rem; }.live-price span { border:1px dashed var(--pretzel); padding:.3rem .55rem; color:var(--pretzel); font-size:.6rem; font-weight:800; text-transform:uppercase; }
        .option-group { min-width:0; margin:0; border:0; padding:0; }.option-group legend { display:flex; width:100%; align-items:center; gap:.55rem; margin-bottom:.65rem; font-size:.72rem; font-weight:700; }
        .option-group legend>span { color:var(--muted); font-weight:500; }.size-chart-link { display:inline-flex; align-items:center; gap:.3rem; margin-left:auto; border:0; border-bottom:1px solid var(--gold); background:transparent; font-size:.68rem; cursor:pointer; }
        .leather-options,.size-options { display:flex; flex-wrap:wrap; gap:.45rem; }.leather-options button { display:flex; min-height:55px; align-items:center; gap:.5rem; border:1px solid var(--line); border-radius:7px; background:rgba(255,255,255,.32); padding:.55rem .7rem; font-size:.69rem; cursor:pointer; }
        .leather-options button i { width:20px; height:20px; border:3px solid rgba(255,255,255,.75); border-radius:50%; background:var(--leather); box-shadow:0 0 0 1px var(--line); }
        .size-options button { min-width:47px; min-height:46px; border:1px solid var(--line); border-radius:50%; background:transparent; font-size:.72rem; cursor:pointer; }
        .leather-options button.selected,.size-options button.selected { border-color:var(--hops); outline:1px dashed var(--pretzel); outline-offset:2px; }
        .option-group button.unavailable { color:var(--muted); text-decoration:line-through; opacity:.5; cursor:not-allowed; }
        .size-hint,.stock-note { margin:.55rem 0 0; color:var(--muted); font-size:.67rem; }.stock-note { color:var(--pretzel); font-weight:700; }
        .variant-error { color:var(--berry); font-size:.75rem; }.variant-error a { text-decoration:underline; }
        .quantity-row { display:flex; align-items:center; justify-content:space-between; font-size:.72rem; font-weight:700; }.quantity-control { display:flex; height:42px; align-items:center; gap:.55rem; border:1px solid var(--line); border-radius:30px; padding:0 .5rem; }
        .quantity-control button { display:grid; width:32px; height:36px; place-items:center; border:0; background:transparent; cursor:pointer; }.quantity-control button:disabled { opacity:.35; cursor:not-allowed; }
        .quantity-control input { width:25px; border:0; outline:0; background:transparent; text-align:center; font-size:.75rem; }
        .measurements { border-top:1px dashed var(--line); border-bottom:1px dashed var(--line); }.measurements summary { display:flex; justify-content:space-between; padding:.8rem 0; font-size:.72rem; font-weight:650; cursor:pointer; }.measurements-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:.65rem; padding-bottom:.9rem; }.measurements-grid label { font-size:.65rem; text-transform:capitalize; }.measurements-grid input { min-height:40px; margin-top:.3rem; background:rgba(255,255,255,.65); }.measurements-grid p { grid-column:span 2; margin:.1rem 0; color:var(--muted); font-size:.65rem; }
        .cta-area { display:grid; }.add-button { width:100%; min-height:56px; }.add-button:disabled { opacity:.55; cursor:not-allowed; transform:none; }.feedback { min-height:16px; margin:.45rem 0 0; color:var(--hops); font-size:.68rem; }.feedback.error { color:var(--berry); }
        .payment-icons { display:flex; flex-wrap:wrap; justify-content:center; gap:.4rem; border-bottom:1px dashed var(--line); padding-bottom:1rem; }.payment-icons span { border:1px solid var(--line); border-radius:4px; padding:.3rem .4rem; font-size:.53rem; font-weight:700; }
        .sticky-atc { position:fixed; z-index:35; right:0; bottom:0; left:0; display:none; align-items:center; justify-content:space-between; gap:.6rem; border-top:1px solid var(--line); padding:.65rem 1rem calc(.65rem + env(safe-area-inset-bottom)); background:var(--cream); box-shadow:0 -4px 18px rgba(20,33,26,.08); }
        .sticky-atc>span { overflow:hidden; max-width:42%; font-family:var(--font-display); font-size:.88rem; text-overflow:ellipsis; white-space:nowrap; }.sticky-atc small { display:block; font-family:var(--font-ui); font-size:.58rem; color:var(--muted); }
        .sticky-atc strong { font-size:.7rem; }.sticky-atc .button-primary { min-height:42px; padding:.6rem .9rem; font-size:.62rem; }
        @media(max-width:800px) { .sticky-atc { display:flex; } }
      `}</style>
    </>
  );
}

export function GiftModule({ gifts }: { gifts: { title: string; value: string; image: ShopifyImage | null }[] }) {
  if (!gifts.length) return null;
  return (
    <section className="gift-module" aria-label="Free gifts included">
      <div className="gift-tag">Free gift included</div><h2>One more reason to celebrate</h2>
      <div>{gifts.map((gift) => <article key={gift.title}>{gift.image && <Image src={gift.image.url} alt={gift.image.altText ?? gift.title} width={54} height={66} />}<span>{gift.title}</span><del>{gift.value}</del></article>)}</div>
      <p>Included with your outfit. Gift items are discounted at checkout.</p>
      <style>{`
        .gift-module { position:relative; border:1px dashed var(--pretzel); border-radius:12px; padding:1.1rem; background:rgba(224,165,38,.09); }
        .gift-tag { position:absolute; top:-10px; right:14px; background:var(--gold); padding:.3rem .55rem; font-size:.58rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        h2 { margin:0 0 .8rem; font-family:var(--font-display); font-size:1.05rem; font-weight:500; }
        .gift-module>div:not(.gift-tag) { display:flex; gap:.65rem; }.gift-module article { display:flex; flex:1; align-items:center; gap:.45rem; min-width:0; font-size:.63rem; }
        .gift-module article img { object-fit:cover; border-radius:5px; }.gift-module article span { flex:1; }.gift-module article del { color:var(--pretzel); }
        .gift-module p { margin:.75rem 0 0; color:var(--muted); font-size:.61rem; }
      `}</style>
    </section>
  );
}

export function TrustBadges({ threshold = "$299", returnDays = 14 }: { threshold?: string; returnDays?: number }) {
  const items = [[Truck, `Fast & free shipping over ${threshold}`], [ShieldCheck, "Secure checkout"], [Heart, `${returnDays}-day returns`], [Check, "German quality"]] as const;
  return <div className="trust-badges">{items.map(([Icon, text]) => <div key={text}><Icon size={20} strokeWidth={1.5} /><span>{text}</span></div>)}<style>{`
    .trust-badges { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; padding-block:1rem; }
    .trust-badges>div { display:flex; align-items:center; gap:.55rem; color:var(--hops); font-size:.65rem; }.trust-badges svg { flex:0 0 auto; }
  `}</style></div>;
}

export function OrderTracker({
  leadDays,
  transitMinDays,
  transitMaxDays,
}: {
  leadDays: number | null;
  transitMinDays: number | null;
  transitMaxDays: number | null;
}) {
  const today = new Date();
  const ready = leadDays === null ? null : addBusinessDays(today, leadDays);
  const deliveredMin = ready && transitMinDays !== null ? addBusinessDays(ready, transitMinDays) : null;
  const deliveredMax = ready && transitMaxDays !== null ? addBusinessDays(ready, transitMaxDays) : null;
  const display = (date: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  const delivered = deliveredMin && deliveredMax
    ? deliveredMin.toDateString() === deliveredMax.toDateString()
      ? display(deliveredMin)
      : `${display(deliveredMin)}–${display(deliveredMax)}`
    : "At checkout";
  const steps = [["Ordered", display(today)], ["Order ready", ready ? display(ready) : "In preparation"], ["Delivered", delivered]];
  return <div className="order-tracker"><p>Estimated delivery</p><div>{steps.map(([title, date], index) => <div key={title}><i>{index === 0 ? <Check size={11} /> : null}</i><strong>{title}</strong><span>{date}</span></div>)}</div><style>{`
    .order-tracker { border-block:1px dashed var(--line); padding:.85rem 0; }.order-tracker>p { margin:0 0 .7rem; font-size:.68rem; font-weight:700; }
    .order-tracker>div { display:grid; grid-template-columns:repeat(3,1fr); }.order-tracker>div>div { position:relative; display:grid; justify-items:center; gap:.2rem; font-size:.61rem; text-align:center; }
    .order-tracker>div>div:not(:last-child)::after { position:absolute; top:8px; left:60%; width:80%; border-top:1px dashed var(--pretzel); content:""; }
    i { z-index:1; display:grid; width:18px; height:18px; place-items:center; border:1px solid var(--hops); border-radius:50%; background:var(--cream); color:var(--hops); font-style:normal; }
    strong { font-size:.6rem; }span { color:var(--muted); font-size:.58rem; }
  `}</style></div>;
}

function addBusinessDays(start: Date, count: number) {
  const result = new Date(start);
  let added = 0;
  while (added < count) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) added += 1;
  }
  return result;
}

export function ProductAccordions({
  material,
  care,
  returnsCopy,
  shippingCopy,
  faqs,
}: {
  material?: string;
  care?: string;
  returnsCopy?: string;
  shippingCopy?: string;
  faqs?: { question: string; answer: string }[];
}) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hash = window.location.hash.slice(1);
      if (faqItems.some((_, index) => `product-faq-${index + 1}` === hash)) setValue(hash);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const items = [
    ["gift-details", "How to get your free Belt & Suspender", "Add a qualifying outfit to your bag. Eligible matching gifts are included automatically and discounted at checkout."],
    ["shipping", "Shipping & Returns", [shippingCopy, returnsCopy].filter(Boolean).join(" ") || "Eligible, unworn items may be returned within 14 days of delivery. Custom-made and final-sale products are not returnable unless faulty."],
    ...(faqs?.length ? faqs : faqItems.map(([question, answer]) => ({ question, answer })))
      .map((item, index) => [`product-faq-${index + 1}`, item.question, item.answer]),
    ["materials", "Materials & Care", [material && `Material: ${material}`, care && `Care: ${care}`].filter(Boolean).join(" ") || "See the garment label for the material composition and care instructions."],
  ];
  return (
    <Accordion.Root className="product-accordions" type="single" collapsible value={value} onValueChange={(next) => {
      setValue(next);
      if (next) history.replaceState(null, "", `#${next}`);
      else history.replaceState(null, "", window.location.pathname + window.location.search);
    }}>
      {items.map(([id, title, copy]) => (
        <Accordion.Item className="accordion-item" value={id} key={id}>
          <Accordion.Header><Accordion.Trigger className="accordion-trigger">{title}<ChevronDown size={16} /></Accordion.Trigger></Accordion.Header>
          <Accordion.Content className="accordion-content">{copy}</Accordion.Content>
        </Accordion.Item>
      ))}
      <style>{`
        .accordion-item { border-top:1px dashed rgba(122,74,37,.4); }.accordion-item:last-child { border-bottom:1px dashed rgba(122,74,37,.4); }
        .accordion-trigger { display:flex; width:100%; min-height:52px; align-items:center; justify-content:space-between; gap:1rem; border:0; background:transparent; padding:.75rem 0; text-align:left; font-size:.72rem; font-weight:700; cursor:pointer; }
        .accordion-trigger svg { flex:0 0 auto; transition:transform .2s; }.accordion-trigger[data-state="open"] svg { transform:rotate(180deg); }
        .accordion-content { overflow:hidden; padding:0 1.6rem .9rem 0; color:var(--muted); font-size:.7rem; line-height:1.7; }
        .accordion-content[data-state="open"] { animation:open .2s ease-out; }@keyframes open { from {height:0;opacity:0} to {height:var(--radix-accordion-content-height);opacity:1} }
      `}</style>
    </Accordion.Root>
  );
}

export type SizeChartRow = { size: string; waist: string; hip: string; chest: string };

export function SizeChartModal({
  productTitle,
  trueToSize,
  sizes,
  chartRows,
  chartImageUrl,
}: {
  productTitle: string;
  trueToSize?: string;
  sizes: string[];
  chartRows: SizeChartRow[];
  chartImageUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("wiesn:open-size-chart", show);
    return () => window.removeEventListener("wiesn:open-size-chart", show);
  }, []);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="chart-overlay" />
        <Dialog.Content className="chart-dialog">
          <div className="chart-header"><div><p className="eyebrow">Find your fit</p><Dialog.Title className="display">The size guide</Dialog.Title><Dialog.Description>{productTitle}</Dialog.Description></div><Dialog.Close className="chart-close" aria-label="Close size chart"><X /></Dialog.Close></div>
          <div className="measure-illustration lozenge"><Ruler size={38} /><span>Measure around the fullest part, keeping the tape comfortably snug. Use the product-specific chart below where provided.</span></div>
          {trueToSize && <p className="true-size">{trueToSize} of customers find this style true to size.</p>}
          {chartImageUrl && <a className="chart-image" href={chartImageUrl} target="_blank" rel="noreferrer"><Image src={chartImageUrl} alt={`${productTitle} size chart`} fill sizes="(max-width:620px) 90vw, 560px" /></a>}
          {chartRows.length ? (
            <div className="chart-table-wrap"><table><caption>Body measurements in centimeters</caption><thead><tr><th scope="col">Size</th><th scope="col">Waist</th><th scope="col">Hip</th><th scope="col">Chest</th></tr></thead><tbody>{chartRows.map((row) => <tr key={row.size}><th scope="row">{row.size}</th><td>{row.waist}</td><td>{row.hip}</td><td>{row.chest}</td></tr>)}</tbody></table></div>
          ) : <div className="chart-missing"><p>A product-specific measurement chart has not been supplied for this style.</p>{sizes.length > 0 && <p>Available size options: {sizes.join(", ")}.</p>}<p>Please contact our fit team before ordering if you need garment measurements.</p></div>}
          <Dialog.Close asChild><button className="button-primary chart-done">Got it</button></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
      <style>{`
        .size-chart-link { display:inline-flex; align-items:center; gap:.3rem; border:0; border-bottom:1px solid var(--gold); background:transparent; font-size:.68rem; cursor:pointer; }
        .chart-overlay { position:fixed; z-index:85; inset:0; background:rgba(20,33,26,.52); }
        .chart-dialog { position:fixed; z-index:86; top:50%; left:50%; display:flex; width:min(620px,calc(100% - 32px)); max-height:88vh; flex-direction:column; overflow:auto; transform:translate(-50%,-50%); border-radius:14px; padding:1.4rem; background:var(--cream); outline:none; }
        .chart-header { display:flex; justify-content:space-between; gap:1rem; }.chart-header p { color:var(--pretzel); }.chart-header h2 { margin:.3rem 0; font-size:2rem; }.chart-header p:last-child { margin:.3rem 0; font-size:.7rem; }
        .chart-close { display:grid; width:42px; height:42px; flex:0 0 42px; place-items:center; border:1px solid var(--line); border-radius:50%; background:transparent; cursor:pointer; }
        .measure-illustration { display:flex; min-height:100px; align-items:center; gap:1rem; margin:1.1rem 0; border-radius:10px; padding:1rem; color:var(--hops); font-size:.75rem; }.chart-image { position:relative; display:block; min-height:200px; margin-bottom:1rem; }.chart-image img { object-fit:contain; }.chart-missing { color:var(--muted); font-size:.75rem; line-height:1.55; }
        .true-size { margin:0 0 .8rem; font-family:var(--font-display); font-size:1.1rem; }.chart-table-wrap { overflow:auto; }
        table { width:100%; border-collapse:collapse; text-align:center; font-size:.7rem; }caption { margin-bottom:.6rem; color:var(--muted); text-align:left; }th,td { border-bottom:1px solid var(--line); padding:.55rem .3rem; }th { font-weight:700; }thead { background:#e9e3d6; }
        .chart-done { margin-top:1rem; }
      `}</style>
    </Dialog.Root>
  );
}

export function DescriptionBlock({ product }: { product: Product }) {
  return (
    <section className="description-block page-shell">
      <p className="eyebrow">The story behind the stitch</p><h2 className="display">Made to wear<br />the night away.</h2>
      <div className="description-html" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
      <div className="description-rows"><p><b>Color</b>{product.options.find((option) => option.name.toLowerCase().includes("color"))?.values.join(", ") ?? product.metafields.find((field) => field?.key === "color")?.value ?? "As pictured"}</p><p><b>Fit</b>{product.metafields.find((field) => field?.key === "fit")?.value ?? "See the size guide for fit details."}</p><p><b>Gift</b>Matching accessories included with eligible styles.</p><p><b>Note</b>Made with care. Natural materials may vary slightly in shade and texture.</p></div>
      <style>{`
        .description-block { display:grid; grid-template-columns:.75fr 1.25fr; gap:1rem 5rem; padding-block:5rem; }
        .description-block>.eyebrow { grid-column:span 2; color:var(--pretzel); }.description-block h2 { grid-row:span 2; margin:0; font-size:clamp(2.6rem,6vw,5rem); line-height:.92; }
        .description-html { color:#454940; font-size:.88rem; line-height:1.8; }.description-html img { max-width:100%; height:auto; }.description-html p { margin:0 0 1rem; }
        .description-rows { grid-column:2; border-top:1px dashed var(--line); }.description-rows p { display:grid; grid-template-columns:100px 1fr; gap:1rem; margin:0; border-bottom:1px dashed var(--line); padding:.7rem 0; color:var(--muted); font-size:.73rem; }
        .description-rows b { color:var(--forest); }
        @media(max-width:700px) { .description-block { grid-template-columns:1fr; gap:1rem; padding-block:3.5rem; }.description-block>.eyebrow,.description-rows { grid-column:1; }.description-block h2 { grid-row:auto; } }
      `}</style>
    </section>
  );
}

export function BenefitsBlock({ leather }: { leather: string }) {
  const benefits = productBenefits(leather);
  return (
    <section className="benefits page-shell">
      <p className="eyebrow">Considered in every detail</p><h2 className="display">Why you&apos;ll love this.</h2>
      <div className="benefit-grid">{benefits.map((benefit) => <p key={benefit}><span><Check size={15} /></span>{benefit}</p>)}</div>
      <div className="benefit-badges">{[["✳", "Authentic Bavarian style"], ["◇", "Premium quality leather"], ["⌁", "Handcrafted details"], ["↗", "Made to last"]].map(([icon, text]) => <div key={text}><span>{icon}</span><b>{text}</b></div>)}</div>
      <style>{`
        .benefits { padding-block:4rem; }.benefits h2 { margin:.5rem 0 1.8rem; font-size:clamp(2.4rem,5vw,4.2rem); }
        .benefit-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:.5rem 2rem; }.benefit-grid p { display:flex; align-items:center; gap:.8rem; margin:0; border-bottom:1px dashed var(--line); padding:.8rem 0; font-size:.78rem; }
        .benefit-grid span { display:grid; width:26px; height:26px; flex:0 0 26px; place-items:center; border:1px dashed var(--pretzel); border-radius:50%; color:var(--hops); }
        .benefit-badges { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-top:2rem; }.benefit-badges>div { display:grid; justify-items:center; gap:.5rem; text-align:center; }
        .benefit-badges span { display:grid; width:46px; height:46px; place-items:center; border:1px dashed var(--pretzel); border-radius:50%; color:var(--hops); font-size:1.2rem; }.benefit-badges b { font-size:.66rem; }
        @media(max-width:650px) { .benefit-grid { grid-template-columns:1fr; }.benefit-badges { grid-template-columns:1fr 1fr; } }
      `}</style>
    </section>
  );
}

export function UgcCarousel({ items = [] }: { items?: { image: ShopifyImage; name: string; location: string; tag: string }[] }) {
  if (!items.length) return null;
  return <section className="ugc-section page-shell"><p className="eyebrow">Worn out there</p><h2 className="display">Real customers, real celebrations.</h2><div className="ugc-rail">{items.map((item) => <figure key={`${item.name}-${item.image.url}`}><Image src={item.image.url} alt={item.image.altText ?? `${item.name} wearing ${item.tag}`} fill sizes="(max-width:700px) 75vw, 25vw" /><figcaption><b>{item.name}</b><span>{item.location} · {item.tag}</span></figcaption></figure>)}</div><style>{`
    .ugc-section { padding-block:4rem; }.ugc-section h2 { margin:.5rem 0 1.5rem; font-size:clamp(2.2rem,5vw,4rem); }.ugc-rail { display:grid; grid-auto-columns:minmax(230px,1fr); grid-auto-flow:column; gap:1rem; overflow:auto; scroll-snap-type:x mandatory; }
    figure { position:relative; min-height:350px; overflow:hidden; margin:0; border-radius:14px; scroll-snap-align:start; background:#ddd4c4; }figure img { object-fit:cover; }figcaption { position:absolute; right:0; bottom:0; left:0; display:grid; gap:.2rem; padding:2rem 1rem 1rem; background:linear-gradient(transparent,rgba(0,0,0,.7)); color:white; font-size:.75rem; }figcaption span { font-size:.64rem; }
  `}</style></section>;
}

export function Reviews({ rating, ratingCount }: { rating: number | null; ratingCount: number | null }) {
  return (
    <section id="reviews" className="reviews page-shell">
      <div><p className="eyebrow">The word from the Wiesn</p><h2 className="display">Customer reviews</h2></div>
      {rating !== null && ratingCount !== null ? <p className="reviews-summary"><strong>{rating.toFixed(1)} / 5</strong><span>{ratingCount} verified reviews</span></p> : <p className="reviews-empty">Reviews are collected through our verified review partner.</p>}
      <Link href="mailto:servus@wiesnatelier.com?subject=Product%20review" className="button-secondary">Write a review</Link>
      <style>{`
        .reviews { display:flex; min-height:170px; align-items:center; justify-content:space-between; gap:1rem; border-block:1px dashed var(--line); padding-block:2rem; }
        .reviews h2 { margin:.45rem 0 0; font-size:2.4rem; }.reviews-summary { display:grid; gap:.25rem; }.reviews-summary strong { font-family:var(--font-display); font-size:2rem; }.reviews-summary span,.reviews-empty { color:var(--muted); font-size:.7rem; }
        @media(max-width:650px) { .reviews { align-items:flex-start; flex-direction:column; } }
      `}</style>
    </section>
  );
}

export function RatingLink({ rating, ratingCount }: { rating: number | null; ratingCount: number | null }) {
  return (
    <button
      type="button"
      className="rating-line"
      onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
      aria-label={`${rating ? `${rating.toFixed(1)} out of 5` : "Reviews"}; jump to customer reviews`}
    >
      <span aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} fill={rating && index < Math.round(rating) ? "currentColor" : "none"} />)}</span>
      <b>{rating ? rating.toFixed(1) : "Reviews"}</b><u>{ratingCount ?? 0} reviews</u>
    </button>
  );
}

export function CompleteTheLook({ products }: { products: Product[] }) {
  const available = products.filter((product) => product.variants.nodes.some((variant) => variant.availableForSale)).slice(0, 8);
  function addWholeLook() {
    if (!available.length) return;
    const lines = available.map((product) => ({ merchandiseId: firstAvailableVariant(product.variants.nodes)!.id, quantity: 1 }));
    void addToCartAction(lines).then((cart) => {
      window.dispatchEvent(new CustomEvent("wiesn:open-cart", { detail: cart }));
      window.dispatchEvent(new CustomEvent("wiesn:cart-updated", { detail: cart }));
    });
  }
  return (
    <section className="complete-look page-shell">
      <div className="section-heading"><div><p className="eyebrow">One good thing leads to another</p><h2 className="display">Complete your Oktoberfest outfit.</h2></div>{available.length > 1 && <button type="button" className="button-primary" onClick={addWholeLook}>Add the whole look <ArrowRight size={15} /></button>}</div>
      {available.length ? <div className="look-rail">{available.map((product) => {
        const variant = firstAvailableVariant(product.variants.nodes)!;
        const discount = discountPercent(variant.price, variant.compareAtPrice);
        return <article key={product.id}><Link href={`/products/${product.handle}`} className="look-image">{product.featuredImage && <Image src={product.featuredImage.url} alt={product.featuredImage.altText ?? product.title} fill sizes="220px" />}</Link><Link href={`/products/${product.handle}`} className="look-title">{product.title}</Link><p>{formatMoney(variant.price)} {variant.compareAtPrice && <del>{formatMoney(variant.compareAtPrice)}</del>} {discount && <b>Save {discount}%</b>}</p><LookAddButton variantId={variant.id} /></article>;
      })}</div> : <p className="look-empty">Related pieces will appear here as the collection grows.</p>}
      <style>{`
        .complete-look { padding-block:4rem; }.complete-look h2 { max-width:750px; margin:.4rem 0 0; font-size:clamp(2.1rem,5vw,4rem); }
        .look-rail { display:grid; grid-auto-columns:minmax(205px,1fr); grid-auto-flow:column; gap:1rem; overflow:auto; padding-bottom:1rem; scroll-snap-type:x mandatory; }
        .look-rail article { display:flex; min-width:0; flex-direction:column; gap:.55rem; scroll-snap-align:start; }.look-image { position:relative; display:block; overflow:hidden; aspect-ratio:4/5; border-radius:12px; background:#e9e3d6; }.look-image img { object-fit:cover; }
        .look-title { overflow:hidden; font-family:var(--font-display); font-size:.95rem; text-overflow:ellipsis; white-space:nowrap; }.look-rail p { display:flex; flex-wrap:wrap; gap:.45rem; margin:0; font-size:.7rem; }.look-rail del { color:var(--muted); }.look-rail p b { color:var(--pretzel); font-size:.62rem; }
        .look-empty { padding-block:2rem; color:var(--muted); }.section-heading .button-primary { white-space:nowrap; }
      `}</style>
    </section>
  );
}

function LookAddButton({ variantId }: { variantId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return <div><button className="look-add" type="button" disabled={pending} onClick={() => startTransition(async () => {
    try { const cart = await addToCartAction([{ merchandiseId: variantId, quantity: 1 }]); window.dispatchEvent(new CustomEvent("wiesn:open-cart", { detail: cart })); window.dispatchEvent(new CustomEvent("wiesn:cart-updated", { detail: cart })); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not add this item."); }
  })}>{pending ? "Adding…" : "Add to bag"}</button>{error && <span role="alert">{error}</span>}<style>{`
    .look-add { width:100%; min-height:40px; border:1px solid var(--hops); border-radius:24px; background:transparent; font-size:.64rem; font-weight:700; text-transform:uppercase; cursor:pointer; }.look-add:hover { background:var(--hops); color:white; }span { color:var(--berry); font-size:.6rem; }
  `}</style></div>;
}
