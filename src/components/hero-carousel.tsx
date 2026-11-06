"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowLeft, ArrowRight } from "lucide-react";

const defaultSlides = [
  {
    kicker: "A little more alpine",
    title: "Meet your\nWiesn\nmoment.",
    alt: "Modern Bavarian-inspired fashion in warm autumn light",
    image: null as string | null,
    mobileImage: null as string | null,
    cta: "Find your outfit",
    href: "/collections/oktoberfest",
  },
  {
    kicker: "Crafted to be kept",
    title: "Tradition,\nwith room\nto roam.",
    alt: "An editorial portrait in understated, timeless clothing",
    image: null,
    mobileImage: null,
    cta: "Shop the collection",
    href: "/collections/lederhosen-men",
  },
  {
    kicker: "Made for your kind of celebration",
    title: "Raise a glass\nto getting\ndressed up.",
    alt: "A contemporary fashion portrait for an evening celebration",
    image: null,
    mobileImage: null,
    cta: "Discover dirndl",
    href: "/collections/dirndl",
  },
];

export type HeroSlideContent = {
  kicker?: string;
  title?: string;
  alt_text?: string;
  desktop_image_url?: string;
  mobile_image_url?: string;
  cta_label?: string;
  cta_url?: string;
};

export function HeroCarousel({
  content = [],
  fallbackImages = [],
}: {
  content?: HeroSlideContent[];
  fallbackImages?: (string | null)[];
}) {
  const slides = defaultSlides.map((slide, index) => {
    const meta = content[index];
    let image = fallbackImages[index] ?? slide.image;
    let mobileImage = image;
    try {
      const candidate = new URL(meta?.desktop_image_url ?? "");
      if (candidate.protocol === "https:" && candidate.hostname.endsWith("shopify.com")) image = candidate.toString();
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
    }
    try {
      const candidate = new URL(meta?.mobile_image_url ?? "");
      if (candidate.protocol === "https:" && candidate.hostname.endsWith("shopify.com")) mobileImage = candidate.toString();
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
    }
    const href = meta?.cta_url?.startsWith("/") && !meta.cta_url.startsWith("//") ? meta.cta_url : slide.href;
    return {
      ...slide,
      kicker: meta?.kicker || slide.kicker,
      title: meta?.title || slide.title,
      alt: meta?.alt_text || slide.alt,
      image,
      mobileImage,
      cta: meta?.cta_label || slide.cta,
      href,
    };
  });
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const touchStart = useRef<number | null>(null);
  const slideCount = slides.length;
  const next = useCallback(() => setActive((current) => (current + 1) % slideCount), [slideCount]);
  const previous = useCallback(() => setActive((current) => (current + slideCount - 1) % slideCount), [slideCount]);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(next, 7000);
    return () => window.clearInterval(timer);
  }, [next, reducedMotion, active]);

  return (
    <section
      className="hero"
      aria-label="Featured collections"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") next();
        if (event.key === "ArrowLeft") previous();
      }}
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        const end = event.changedTouches[0]?.clientX;
        if (touchStart.current !== null && end !== undefined && Math.abs(end - touchStart.current) > 55) {
          if (end < touchStart.current) next();
          else previous();
        }
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="hero-slide"
          initial={reducedMotion ? false : { opacity: 0, clipPath: "inset(0 50% 0 50%)" }}
          animate={{ opacity: 1, clipPath: "inset(0 0% 0 0%)" }}
          exit={reducedMotion ? undefined : { opacity: 0, clipPath: "inset(0 0 0 100%)" }}
          transition={{ duration: reducedMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {slides[active]!.image ? (
            <picture className="hero-picture">
              {slides[active]!.mobileImage && <source media="(max-width: 700px)" srcSet={slides[active]!.mobileImage!} />}
              <Image src={slides[active]!.image!} alt={slides[active]!.alt} fill priority={active === 0} sizes="100vw" className="hero-image" />
            </picture>
          ) : <div className="hero-art" aria-hidden="true" />}
          <div className="hero-shade" />
          <div className="hero-content page-shell">
            <p className="eyebrow">{slides[active]!.kicker}</p>
            <h1 className="display">{slides[active]!.title.split("\n").map((line, index) => <span key={index}>{line}<br /></span>)}</h1>
            <Link href={slides[active]!.href} className="button-primary">{slides[active]!.cta}<ArrowDownRight size={17} /></Link>
          </div>
          <span className="hero-index">0{active + 1}<i> / 0{slides.length}</i></span>
        </motion.div>
      </AnimatePresence>
      <div className="hero-controls page-shell">
        <div className="hero-progress" role="group" aria-label="Choose a featured slide">
          {slides.map((slide, index) => (
            <button type="button" key={slide.kicker} aria-label={`Show slide ${index + 1}: ${slide.kicker}`} aria-pressed={index === active} onClick={() => setActive(index)}>
              <span style={{ transform: `scaleX(${index === active ? 1 : 0})` }} />
            </button>
          ))}
        </div>
        <div className="hero-arrows">
          <button type="button" onClick={previous} aria-label="Previous slide"><ArrowLeft size={17} /></button>
          <button type="button" onClick={next} aria-label="Next slide"><ArrowRight size={17} /></button>
        </div>
      </div>
      <style>{`
        .hero { position:relative; height:min(790px,calc(100svh - 105px)); min-height:580px; overflow:hidden; background:#28372b; color:white; }
        .hero-art { position:absolute; inset:0; background:radial-gradient(ellipse at 76% 24%,rgba(216,232,94,.42),transparent 28%),radial-gradient(ellipse at 10% 100%,rgba(178,109,66,.3),transparent 42%),linear-gradient(125deg,#14211a 6%,#344b2e 58%,#76533a); }
        .hero-slide { position:absolute; inset:0; }
        .hero-picture { position:absolute; inset:0; }
        .hero-image { object-fit:cover; object-position:center 38%; }
        .hero-shade { position:absolute; inset:0; background:linear-gradient(90deg,rgba(13,23,17,.72),rgba(13,23,17,.18) 68%,rgba(13,23,17,.08)),linear-gradient(0deg,rgba(13,23,17,.48),transparent 35%); }
        .hero-content { position:relative; display:flex; height:100%; flex-direction:column; align-items:flex-start; justify-content:center; padding-top:1rem; }
        .hero-content .eyebrow { color:#e4ed9a; }
        .hero-content h1 { max-width:900px; margin:1.15rem 0 2rem; font-size:clamp(5rem,11vw,10rem); line-height:.79; letter-spacing:-.065em; text-wrap:balance; }
        .hero-content .button-primary { min-height:52px; border-color:#d8e85e; background:#d8e85e; color:#17251c; }
        .hero-content .button-primary:hover { background:#edf59c; }
        .hero-index { position:absolute; right:max(24px,calc((100vw - 1440px)/2)); bottom:2rem; font-family:var(--font-display); font-size:1.6rem; }
        .hero-index i { color:rgba(255,255,255,.55); font-family:var(--font-ui); font-size:.62rem; font-style:normal; }
        .hero-controls { position:absolute; right:0; bottom:2rem; left:0; display:flex; align-items:center; justify-content:space-between; }
        .hero-progress { display:flex; width:min(340px,60%); gap:.5rem; }
        .hero-progress button { position:relative; flex:1; height:16px; overflow:hidden; border:0; border-top:1px solid rgba(255,255,255,.45); background:transparent; cursor:pointer; }
        .hero-progress button span { position:absolute; inset:-1px 0 auto; height:2px; background:#d8e85e; transform-origin:left; transition:transform .35s; }
        .hero-arrows { display:flex; gap:.45rem; }
        .hero-arrows button { display:grid; width:42px; height:42px; place-items:center; border:1px solid rgba(255,255,255,.56); border-radius:50%; background:transparent; color:white; cursor:pointer; }
        .hero-arrows button:hover { background:white; color:var(--forest); }
        @media(max-width:700px) { .hero { height:calc(82svh - 98px); min-height:540px; max-height:740px; } .hero-image { object-position:58% center; } .hero-content { justify-content:flex-end; padding-bottom:8rem; } .hero-content h1 { font-size:clamp(4.2rem,18vw,7.4rem); } .hero-index { right:16px; bottom:1.8rem; } .hero-controls { bottom:1.8rem; } .hero-arrows button { width:37px; height:37px; } }
      `}</style>
    </section>
  );
}
