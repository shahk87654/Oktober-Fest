"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { collectionHandles } from "@/lib/config";

const banners = [
  {
    src: "https://oktoberfestoutfits.com/cdn/shop/files/lederhosen-dirndl-hero-banner-homepage.webp?v=1783723745&width=1100",
    alt: "Lederhosen and dirndl styles for Oktoberfest",
    tag: "COUTURE COLLECTION 2026",
    title: "Handcrafted Bavarian Elegance",
    subtitle: "Authentic lederhosen & dirndls made from prime European deerskin and silk.",
    href: `/collections/${collectionHandles.featured}`,
    cta: "EXPLORE THE HERO EDIT",
  },
  {
    src: "https://oktoberfestoutfits.com/cdn/shop/files/comfort-stylish-dirndl-hero-banner.webp?v=1783725787&width=1100",
    alt: "Comfort and style in a traditional dirndl",
    tag: "WOMEN'S ATELIER",
    title: "A Contemporary View on Tradition",
    subtitle: "Tailored bodices, hand-pleated aprons, and delicate embroidery.",
    href: `/collections/${collectionHandles.women}`,
    cta: "DISCOVER WOMEN'S EDIT",
  },
  {
    src: "https://oktoberfestoutfits.com/cdn/shop/files/oktoberfestoutfits-for-women-hero-banner.webp?v=1783722360&width=1100",
    alt: "Oktoberfest outfits for women",
    tag: "BAVARIAN FESTIVE WEAR",
    title: "Made for Unforgettable Moments",
    subtitle: "Celebrate with heirloom pieces designed to be cherished for generations.",
    href: `/collections/${collectionHandles.women}`,
    cta: "VIEW FESTIVE STYLES",
  },
];

export function HomeBannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeBanner = banners[activeIndex];

  const showPrevious = () => setActiveIndex((index) => (index - 1 + banners.length) % banners.length);
  const showNext = () => setActiveIndex((index) => (index + 1) % banners.length);

  useEffect(() => {
    if (isPaused) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % banners.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  return (
    <section
      className="home-banner-carousel relative overflow-hidden group"
      aria-label="Oktoberfest collections"
      aria-roledescription="carousel"
    >
      <div className="relative w-full aspect-[16/9] sm:aspect-[2.2/1] min-h-[460px] max-h-[720px] bg-slate-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner.src}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Link
              href={activeBanner.href}
              className="relative block w-full h-full"
              aria-label={`Shop: ${activeBanner.alt}`}
            >
              <Image
                src={activeBanner.src}
                alt={activeBanner.alt}
                fill
                priority={activeIndex === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/35 sm:to-transparent" />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Floating Hero Content Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-6 sm:p-12 md:p-16 max-w-2xl text-white z-10">
          <motion.div
            key={`content-${activeIndex}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-bold tracking-widest text-emerald-200">
              <Sparkles size={13} className="text-emerald-300" />
              <span>{activeBanner.tag}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-[1.1] text-white">
              {activeBanner.title}
            </h1>
            <p className="text-sm sm:text-base text-white/85 font-normal max-w-md line-clamp-2 leading-relaxed">
              {activeBanner.subtitle}
            </p>
            <div className="pt-2 pointer-events-auto">
              <Link
                href={activeBanner.href}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-slate-900 font-bold text-xs tracking-wider shadow-lg hover:bg-emerald-50 hover:text-emerald-950 transition-all duration-300 hover:scale-[1.02]"
              >
                <span>{activeBanner.cta}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Controls Bar */}
      <div className="home-banner-controls">
        <button
          type="button"
          onClick={() => setIsPaused((paused) => !paused)}
          aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button type="button" onClick={showPrevious} aria-label="Previous banner">
          <ArrowLeft size={16} />
        </button>
        <div className="home-banner-dots" role="group" aria-label="Choose a banner">
          {banners.map((banner, index) => (
            <button
              type="button"
              key={banner.src}
              className={index === activeIndex ? "is-active" : ""}
              aria-label={`Show banner ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
        <span className="home-banner-count">
          {String(activeIndex + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
        </span>
        <button type="button" onClick={showNext} aria-label="Next banner">
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
