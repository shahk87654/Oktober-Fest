"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { collectionHandles } from "@/lib/config";

const banners = [
  {
    src: "https://oktoberfestoutfits.com/cdn/shop/files/lederhosen-dirndl-hero-banner-homepage.webp?v=1783723745&width=1100",
    alt: "Lederhosen and dirndl styles for Oktoberfest",
    href: `/collections/${collectionHandles.featured}`,
  },
  {
    src: "https://oktoberfestoutfits.com/cdn/shop/files/comfort-stylish-dirndl-hero-banner.webp?v=1783725787&width=1100",
    alt: "Comfort and style in a traditional dirndl",
    href: `/collections/${collectionHandles.women}`,
  },
  {
    src: "https://oktoberfestoutfits.com/cdn/shop/files/oktoberfestoutfits-for-women-hero-banner.webp?v=1783722360&width=1100",
    alt: "Oktoberfest outfits for women",
    href: `/collections/${collectionHandles.women}`,
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
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  return (
    <section
      className="home-banner-carousel"
      aria-label="Oktoberfest collections"
      aria-roledescription="carousel"
    >
      <Link className="home-banner-image" href={activeBanner.href} aria-label={`Shop: ${activeBanner.alt}`}>
        <Image
          src={activeBanner.src}
          alt={activeBanner.alt}
          fill
          priority={activeIndex === 0}
          sizes="100vw"
        />
      </Link>
      <div className="home-banner-controls" aria-label="Banner navigation">
        <button
          type="button"
          onClick={() => setIsPaused((paused) => !paused)}
          aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
        >
          {isPaused ? <Play size={15} /> : <Pause size={15} />}
        </button>
        <button type="button" onClick={showPrevious} aria-label="Previous banner">
          <ArrowLeft size={17} />
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
        <span className="home-banner-count">{String(activeIndex + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}</span>
        <button type="button" onClick={showNext} aria-label="Next banner">
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}
