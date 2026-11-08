"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  Search,
  LayoutGrid,
  Layers,
  ShieldCheck,
  Truck,
  Award,
  Compass,
  X,
  ChevronRight,
  HelpCircle,
  Scissors,
} from "lucide-react";
import type { ShopifyCollectionSummary } from "@/lib/shopify/types";
import { imageUrl } from "@/lib/format";

export interface EnrichedCollection {
  id: string;
  handle: string;
  title: string;
  displayTitle: string;
  description: string;
  category: "all" | "men" | "women" | "kids" | "accessories";
  categoryLabel: string;
  image: {
    url: string;
    altText: string | null;
  };
  highlights: string[];
  materialsTag: string;
  chapterNumber: string;
  accentBadge?: string;
}

// Curated high-fashion editorial metadata to enrich Shopify collections
const CURATED_METADATA: Record<
  string,
  {
    displayTitle: string;
    category: "men" | "women" | "kids" | "accessories" | "all";
    categoryLabel: string;
    description: string;
    highlights: string[];
    materialsTag: string;
    fallbackImage: string;
    accentBadge?: string;
  }
> = {
  men: {
    displayTitle: "Men's Bavarian Outfits",
    category: "men",
    categoryLabel: "Herren Tracht",
    description:
      "Complete festival ensembles pairing authentic wild buckskin lederhosen with tailored Bavarian linen shirts and hand-tooled braces.",
    highlights: ["Complete Ensembles", "Wild Buckskin", "Traditional Relief"],
    materialsTag: "Wild Buckskin • Pure Linen",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/oktoberfest-mens-outfits-collection.webp",
    accentBadge: "Flagship Edition",
  },
  women: {
    displayTitle: "Women's Trachten & Dirndls",
    category: "women",
    categoryLabel: "Damen Tracht",
    description:
      "Exquisite Alpine Dirndls, hand-pleated silk jacquard aprons, and structured velvet bodices crafted for regal festival elegance.",
    highlights: ["Midi & Maxi Lengths", "Silk Jacquard", "Hand-Pleated Skirts"],
    materialsTag: "Austrian Silk • Velvet Bodice",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/women-collections-oktoberfest-outfits-feature.webp",
    accentBadge: "Couture Tracht",
  },
  kids: {
    displayTitle: "Junior Bavarian Tracht",
    category: "kids",
    categoryLabel: "Kinder Tracht",
    description:
      "Heirloom-grade children's lederhosen and miniature dirndl sets crafted with soft leather and resilient seams to withstand years of joy.",
    highlights: ["Ultra-Soft Goatskin", "Adjustable Straps", "Breathable Linings"],
    materialsTag: "Soft Suede • Cotton Linings",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/Kids-collections-oktoberfest-outfits-feature.webp",
    accentBadge: "Heirloom Edition",
  },
  "lederhosen-men": {
    displayTitle: "Authentic Men's Lederhosen",
    category: "men",
    categoryLabel: "Lederhosen",
    description:
      "Classic knee-length lederhosen hand-embroidered with Bavarian oak leaf motifs, relief horn buttons, and adjustable gusset lacing.",
    highlights: ["Knee-Length Cut", "Real Staghorn", "Oak Leaf Embroidery"],
    materialsTag: "Wild Goat Suede • Birch Tanning",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/deer-lederhosen.png",
    accentBadge: "Best Seller",
  },
  bundhosen: {
    displayTitle: "Traditional Bundhosen",
    category: "men",
    categoryLabel: "Kniebundhosen",
    description:
      "Distinguished below-the-knee alpine breeches featuring calf-lacing bands, knife pocket detailing, and traditional stag crests.",
    highlights: ["Below-the-Knee Cut", "Hand-Tied Calves", "Gusset Lacing"],
    materialsTag: "Heavy-Gauge Suede • Antique Buckles",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/oktoberfest-outfits-men-bundhose-banner.jpg",
    accentBadge: "Alpine Classic",
  },
  dirndl: {
    displayTitle: "Artisan Dirndl Dresses",
    category: "women",
    categoryLabel: "Dirndl Kleider",
    description:
      "The crown jewel of alpine feminine fashion, featuring hand-gathered Hansel pleating, boned corsets, and shimmering aprons.",
    highlights: ["Bespoke Bodice", "Detachable Aprons", "Corset Ribbons"],
    materialsTag: "Silk Brocade • Lace Aprons",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/dirndl-collections-oktoberfest-outfits-feature.webp",
    accentBadge: "Master Piece",
  },
  blouses: {
    displayTitle: "Dirndl Blouses & Tops",
    category: "women",
    categoryLabel: "Dirndlblusen",
    description:
      "Romantic lace and crisp cotton blouses with sweetheart, balcony, and high-neck silhouettes tailored to elevate any dirndl.",
    highlights: ["Floral Lace", "Comfort Stretch Underbust", "Sweetheart Necklines"],
    materialsTag: "Egyptian Cotton • Chantilly Lace",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/blouses-mobile-version.webp",
    accentBadge: "Essential Layer",
  },
  "lederhosen-women": {
    displayTitle: "Women's Modern Lederhosen",
    category: "women",
    categoryLabel: "Damen Lederhosen",
    description:
      "Modern tailored feminine cut lederhosen blending playful Bavarian celebration spirit with ultra-supple goat suede comfort.",
    highlights: ["Tailored Slim Fit", "Delicate Floral Embroidery", "All-Day Comfort"],
    materialsTag: "Fine Goat Suede • Horn Accents",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/07_Teaser_Home-Damen.png",
    accentBadge: "Contemporary",
  },
  "trachten-shirts": {
    displayTitle: "Trachten Shirts & Linens",
    category: "men",
    categoryLabel: "Trachtenhemden",
    description:
      "Alpine gingham checks, traditional pfoad stand collars, and breathable natural linen woven for warm festival marquee tents.",
    highlights: ["Bavarian Gingham", "Roll-Up Tab Sleeves", "Horn Buttons"],
    materialsTag: "100% Alpine Linen & Cotton",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/trachten-shirt-collections.webp",
    accentBadge: "Breathable Natural",
  },
  vest: {
    displayTitle: "German Vests (Trachtenwesten)",
    category: "men",
    categoryLabel: "Trachtenwesten",
    description:
      "Tailored jewel-tone velvet and jacquard waistcoats with Bavarian ball buttons, double welt pockets, and adjustable silk back cinches.",
    highlights: ["Tailored Back Cinch", "Bavarian Coin Buttons", "Double Welt Pockets"],
    materialsTag: "Cotton Velvet • Silk Back",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/oktoberfest-outfits-men-vest--lederhosen-costume-banner.webp",
    accentBadge: "Tailored Luxury",
  },
  "trachten-jackets": {
    displayTitle: "Loden Jankers & Jackets",
    category: "men",
    categoryLabel: "Trachtenjanker",
    description:
      "Iconic Austrian walk-loden wool jackets featuring contrast forest-green standing tab collars, coin buttons, and rear inverted box pleats.",
    highlights: ["Austrian Walk-Loden", "Contrast Green Collar", "Horn Buttons"],
    materialsTag: "100% Virgin Alpine Wool",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/men-jacket-trachten.webp",
    accentBadge: "Winter Proof",
  },
  shoes: {
    displayTitle: "Haferlschuhe & Alpine Footwear",
    category: "accessories",
    categoryLabel: "Haferlschuhe",
    description:
      "Double-stitched traditional leather shoes with signature side lacing, non-slip alpine rubber soles, and Norwegian welting.",
    highlights: ["Norwegian Welted", "Signature Side Lacing", "Vibram Grip Sole"],
    materialsTag: "Full-Grain Saddle Leather",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/pixelup_1736954937239.jpg",
    accentBadge: "Hand-Crafted",
  },
  "trachten-socks": {
    displayTitle: "Loferl & Bavarian Wool Socks",
    category: "accessories",
    categoryLabel: "Loferl & Socken",
    description:
      "Authentic two-piece calf warmers and cable-knit merino wool knee stockings featuring intricate alpine cable braid motifs.",
    highlights: ["Traditional 2-Piece Loferl", "Cable Braid Motifs", "Hand-Linked Toe"],
    materialsTag: "Virgin Merino Wool",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/oktoberfest-outfits-men-socks-collection.jpg",
    accentBadge: "Authentic Loferl",
  },
  hats: {
    displayTitle: "Bavarian Wool Hats (Trachtenhüte)",
    category: "accessories",
    categoryLabel: "Trachtenhüte",
    description:
      "Hand-blocked wool felt alpine hats adorned with traditional cord bands, metal crest pins, and gamsbart tuft holders.",
    highlights: ["Crushable Wool Felt", "Water-Repellent", "Triple-Cord Band"],
    materialsTag: "100% Bavarian Wool Felt",
    fallbackImage:
      "https://cdn.shopify.com/s/files/1/0882/5094/1751/collections/IMG_4605.webp",
    accentBadge: "Munich Style",
  },
  accessories: {
    displayTitle: "Atelier Accessories & Charivari",
    category: "accessories",
    categoryLabel: "Accessoires",
    description:
      "Antique silver charivari chains, trophy coins, badges, pocket watches, and authentic wild boar hair gamsbart tufts.",
    highlights: ["Antique Silver Filigree", "Trophy Medallions", "Pocket Watch Mounts"],
    materialsTag: "Solid Brass & Sterling Accents",
    fallbackImage:
      "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=1200&q=80",
    accentBadge: "Finishing Touch",
  },
  belts: {
    displayTitle: "Embossed Leather Belts",
    category: "accessories",
    categoryLabel: "Trachtengürtel",
    description:
      "Thick vegetable-tanned saddle leather belts with hand-cast Bavarian lion, stag, and edelweiss antique silver buckles.",
    highlights: ["Heavy Saddle Leather", "Interchangeable Cast Buckle", "Hand-Burnished Edges"],
    materialsTag: "Bavarian Cowhide • Cast Pewter",
    fallbackImage:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
    accentBadge: "Solid Leather",
  },
  suspender: {
    displayTitle: "Relief Suspenders & H-Braces",
    category: "accessories",
    categoryLabel: "Hosenträger",
    description:
      "Traditional H-bar leather suspenders featuring ornate relief-embroidered chest bridges, buckhorn sliders, and heavy attachment tabs.",
    highlights: ["Hand-Tooled Chest Bridge", "Adjustable Length", "Staghorn Buckles"],
    materialsTag: "Full-Grain Leather • Staghorn Hardware",
    fallbackImage:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    accentBadge: "Hand-Embossed",
  },
  "lederhosen-kids": {
    displayTitle: "Junior Boys' Lederhosen",
    category: "kids",
    categoryLabel: "Kinder Lederhosen",
    description:
      "Ultra-soft, supple suede lederhosen with elastic comfort waistbands and removable braces made for active celebration.",
    highlights: ["Super-Soft Suede", "Elastic Back Band", "Removable Suspenders"],
    materialsTag: "Supple Goatskin • Cotton Lining",
    fallbackImage:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
    accentBadge: "Youth Fit",
  },
  "dirndl-kids": {
    displayTitle: "Junior Girls' Dirndl Sets",
    category: "kids",
    categoryLabel: "Kinder Dirndl",
    description:
      "Charming three-piece dirndl sets including dress, ruffled cotton blouse, and satin contrast apron designed for young maidens.",
    highlights: ["Complete 3-Piece Set", "Comfort Fit Elastic", "Festive Satin Apron"],
    materialsTag: "Soft Cotton • Satin Jacquard",
    fallbackImage:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80",
    accentBadge: "Junior Ensemble",
  },
  "new-arrival": {
    displayTitle: "New Season 2026 Arrivals",
    category: "all",
    categoryLabel: "Neuheiten 2026",
    description:
      "The newest Alpine seasonal capsules, fresh colorways, and limited master workshop editions tailored for Oktoberfest 2026.",
    highlights: ["Limited Atelier Production", "Exclusive 2026 Dye Lots", "Numbered Run"],
    materialsTag: "Master Reserve Leathers & Silks",
    fallbackImage:
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=1200&q=80",
    accentBadge: "Fresh Capsule",
  },
};

const OCCASIONS = [
  {
    title: "The Munich Wiesn",
    badge: "Beer Garden & Marquee",
    summary:
      "High-energy festival tents, brass bands, and hearty revelry. Built with resilient goat suede and breathable linens.",
    primaryHandle: "men",
    secondaryHandle: "dirndl",
    primaryLabel: "Shop Men's Outfits",
    secondaryLabel: "Shop Dirndl Dresses",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Alpine Weddings & Galas",
    badge: "Ceremonial Haute Tracht",
    summary:
      "Shimmering Austrian silk brocades, hand-pleated Dirndls, velvet corsets, and tailored virgin-loden janker jackets.",
    primaryHandle: "women",
    secondaryHandle: "vest",
    primaryLabel: "Explore Bridal Tracht",
    secondaryLabel: "Explore Velvet Vests",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Sunday Alm & Biergarten",
    badge: "Everyday Heritage",
    summary:
      "Casual alpaca knitwear, comfortable below-the-knee bundhosen, and soft washed linen shirts for relaxed weekend gathering.",
    primaryHandle: "bundhosen",
    secondaryHandle: "trachten-shirts",
    primaryLabel: "Shop Bundhosen",
    secondaryLabel: "Shop Trachten Shirts",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Generations & Heirlooms",
    badge: "Junior Tradition",
    summary:
      "Handcrafted with generous hems and soft adjustable suspenders, designed to be celebrated today and passed down tomorrow.",
    primaryHandle: "kids",
    secondaryHandle: "accessories",
    primaryLabel: "Shop Junior Collection",
    secondaryLabel: "Shop Accessories",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
  },
];

const FAQS = [
  {
    question: "What is the difference between Lederhosen and Bundhosen?",
    answer:
      "Short Lederhosen end just above or right at the kneecap and are traditionally paired with two-piece Loferl socks. Bundhosen (Kniebundhosen) extend 2 to 3 inches below the knee with calf-lacing ties, offering a distinguished, warmer silhouette ideal for cooler evenings or traditional galas.",
  },
  {
    question: "How should an authentic Dirndl fit?",
    answer:
      "An authentic Bavarian dirndl bodice must fit snugly against the ribs and bust like a second skin without gaping or pinching, creating the classic upright posture. The skirt hangs from the natural waist, usually 60cm (midi) or 70cm (below knee) from waist to hem.",
  },
  {
    question: "What does the Dirndl apron bow placement signify?",
    answer:
      "Tied on the wearer's left side: single / available. Tied on the wearer's right side: married, engaged, or in a committed relationship. Tied in the center front: traditionally young girls or undecided. Tied in the center back: widows, waitresses, or servers.",
  },
  {
    question: "How do I care for genuine wild buckskin leather?",
    answer:
      "Never machine wash real leather! Genuine buckskin and goat suede develop a rich, celebrated patina over decades of wear. For minor spots, use a soft brass suede brush or dry rubber crepe block. Hang your lederhosen in fresh mountain air to deodorize.",
  },
];

interface CollectionsCatalogProps {
  collections: ShopifyCollectionSummary[];
}

export function CollectionsCatalog({ collections }: CollectionsCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [layoutMode, setLayoutMode] = useState<"bento" | "grid">("bento");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Enrich Shopify collections with curated fashion metadata and fallbacks
  const enrichedList: EnrichedCollection[] = useMemo(() => {
    return collections.map((col, index) => {
      const meta = CURATED_METADATA[col.handle] || {
        displayTitle:
          col.title.toLowerCase().startsWith("men")
            ? "Men's Bavarian Collection"
            : col.title.toLowerCase().startsWith("women")
              ? "Women's Trachten Collection"
              : col.title.charAt(0).toUpperCase() + col.title.slice(1).toLowerCase(),
        category: "all" as const,
        categoryLabel: "Alpine Tracht",
        description:
          col.description ||
          "Masterfully tailored Bavarian craftsmanship for Oktoberfest festivities and alpine celebrations.",
        highlights: ["Handcrafted", "Authentic Cut", "Bavarian Design"],
        materialsTag: "Natural Materials • Heritage Craft",
        fallbackImage:
          "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=1200&q=80",
        accentBadge: "Archive Edit",
      };

      // Determine image URL: prioritize real Shopify image, fallback gracefully
      const finalImageUrl = col.image?.url || meta.fallbackImage;
      const finalAlt = col.image?.altText || `${meta.displayTitle} Collection`;

      return {
        id: col.id,
        handle: col.handle,
        title: col.title,
        displayTitle: meta.displayTitle,
        description: col.description || meta.description,
        category: meta.category,
        categoryLabel: meta.categoryLabel,
        image: {
          url: finalImageUrl,
          altText: finalAlt,
        },
        highlights: meta.highlights,
        materialsTag: meta.materialsTag,
        chapterNumber: String(index + 1).padStart(2, "0"),
        accentBadge: meta.accentBadge,
      };
    });
  }, [collections]);

  // Categories with counts
  const categories = useMemo(() => {
    return [
      { id: "all", label: "All Chapters", count: enrichedList.length },
      {
        id: "men",
        label: "Herren (Men's Tracht)",
        count: enrichedList.filter((c) => c.category === "men").length,
      },
      {
        id: "women",
        label: "Damen (Women's Dirndl)",
        count: enrichedList.filter((c) => c.category === "women").length,
      },
      {
        id: "kids",
        label: "Kinder (Junior Heirlooms)",
        count: enrichedList.filter((c) => c.category === "kids").length,
      },
      {
        id: "accessories",
        label: "Accessoires & Footwear",
        count: enrichedList.filter((c) => c.category === "accessories").length,
      },
    ];
  }, [enrichedList]);

  // Filtered collections based on category tab & search query
  const filteredCollections = useMemo(() => {
    return enrichedList.filter((c) => {
      const matchesCategory =
        activeCategory === "all" || c.category === activeCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        c.displayTitle.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.categoryLabel.toLowerCase().includes(q) ||
        c.materialsTag.toLowerCase().includes(q)
      );
    });
  }, [enrichedList, activeCategory, searchQuery]);

  // Spotlight flagship hero: first item in the list or filtered list
  const heroCollection = enrichedList[0];

  return (
    <div className="w-full bg-[#FAFAF8] text-slate-900 min-h-screen selection:bg-emerald-900 selection:text-white">
      {/* 1. ARCHITECTURAL MASTHEAD HERO */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80 overflow-hidden bg-gradient-to-b from-white via-[#FAF9F6] to-[#FAFAF8]">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-700/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-amber-600/4 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/5 border border-emerald-900/10 text-emerald-950 text-xs font-semibold tracking-widest uppercase mb-6 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Munich Wiesn & Alpine Archive • 2026 Season</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-slate-900 leading-[1.08]">
                The Wardrobe, <br />
                <span className="italic font-normal text-emerald-900">in Curated Chapters.</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Explore authentic Bavarian Trachten, wild-buckskin lederhosen, silk-jacquard
                dirndls, and heirloom accessories crafted according to century-old Alpine tailoring traditions.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.03)] backdrop-blur-md">
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
                  {String(enrichedList.length).padStart(2, "0")}
                </div>
                <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                  Curated Edits
                </div>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
                  100%
                </div>
                <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                  Alpine Provenance
                </div>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
                  2026
                </div>
                <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                  Active Edition
                </div>
              </div>
            </div>
          </div>

          {/* 2. INTERACTIVE CONTROLS: Category Tabs + Live Search + Layout Toggle */}
          <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-6 border-t border-slate-200/70">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-emerald-900 text-white shadow-md shadow-emerald-950/20"
                        : "bg-white/80 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/80"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Search and Layout Toggles */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter chapters (e.g. Lederhosen)..."
                  className="w-full pl-9 pr-8 py-2 rounded-full bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-800/30 focus:border-emerald-800 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Layout Switcher */}
              <div className="hidden sm:flex items-center p-1 rounded-full bg-slate-200/70 border border-slate-300/40">
                <button
                  onClick={() => setLayoutMode("bento")}
                  aria-label="Editorial Bento View"
                  title="Editorial Bento Layout"
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    layoutMode === "bento"
                      ? "bg-white text-emerald-950 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Layers size={15} />
                </button>
                <button
                  onClick={() => setLayoutMode("grid")}
                  aria-label="Grid View"
                  title="Balanced Grid Layout"
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    layoutMode === "grid"
                      ? "bg-white text-emerald-950 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED FLAGSHIP EDIT (Only shown when viewing all & no search query) */}
      {activeCategory === "all" && !searchQuery && heroCollection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link
            href={`/collections/${heroCollection.handle}`}
            className="group block relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-[0_15px_45px_rgba(15,23,42,0.08)] transition-all duration-700 hover:shadow-[0_25px_60px_rgba(15,23,42,0.16)]"
          >
            <div className="relative min-h-[460px] md:min-h-[520px] w-full flex items-end">
              {/* Image with zoom on hover */}
              <Image
                src={imageUrl(heroCollection.image.url, 1800)}
                alt={heroCollection.image.altText ?? heroCollection.displayTitle}
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />

              {/* Luxury gradient scrim overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-radial-at-t from-transparent via-transparent to-black/30 pointer-events-none" />

              {/* Floating Top Badge */}
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2.5">
                <span className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-emerald-950 text-xs font-bold tracking-widest uppercase shadow-sm">
                  Chapter 01 • Master Archive
                </span>
                <span className="px-3 py-1.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold tracking-wider uppercase">
                  Flagship Collection
                </span>
              </div>

              {/* Bottom Copy Overlay */}
              <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-3xl">
                <span className="text-emerald-300 font-semibold tracking-widest text-xs uppercase flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  AUTHENTIC BAVARIAN TRACHTEN
                </span>

                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-[1.1]">
                  {heroCollection.displayTitle}
                </h2>

                <p className="mt-4 text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl">
                  {heroCollection.description}
                </p>

                {/* Micro tags */}
                <div className="flex flex-wrap items-center gap-2 mt-5">
                  {heroCollection.highlights.map((h) => (
                    <span
                      key={h}
                      className="px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-sm text-slate-100 text-[11px] font-medium border border-white/10"
                    >
                      {h}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-md bg-amber-400/20 backdrop-blur-sm text-amber-200 text-[11px] font-semibold border border-amber-300/30">
                    {heroCollection.materialsTag}
                  </span>
                </div>

                {/* CTA Button */}
                <div className="mt-8 inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-white text-slate-900 font-semibold text-xs sm:text-sm tracking-wider uppercase group-hover:bg-emerald-900 group-hover:text-white transition-all duration-300 shadow-lg">
                  <span>DISCOVER CHAPTER 01</span>
                  <ArrowUpRight
                    size={16}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 4. MAIN COLLECTION CATALOG LISTING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Section Headline */}
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-slate-200/80">
          <div>
            <span className="text-xs font-bold text-emerald-800 tracking-widest uppercase flex items-center gap-1.5 mb-1">
              <Sparkles size={13} className="text-emerald-600" />
              CURATED SELECTIONS
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-medium text-slate-900">
              {activeCategory === "all"
                ? "Complete Seasonal Catalog"
                : categories.find((c) => c.id === activeCategory)?.label || "Selected Chapters"}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              {filteredCollections.length}{" "}
              {filteredCollections.length === 1 ? "Chapter" : "Chapters"} Found
            </span>
          </div>
        </div>

        {/* Empty State */}
        {filteredCollections.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Search size={24} />
            </div>
            <h3 className="font-serif text-2xl font-medium text-slate-900 mb-2">
              No matching collections found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              We couldn't find any collection matching &ldquo;{searchQuery}&rdquo;. Try another
              search keyword or switch to all chapters.
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="px-6 py-2.5 rounded-full bg-emerald-900 text-white font-medium text-xs tracking-wider uppercase hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Cards Grid: Bento or Balanced Grid */
          <div
            className={
              layoutMode === "bento" && activeCategory === "all" && !searchQuery
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            }
          >
            {filteredCollections.map((col, idx) => {
              // Bento layout logic: make certain cards spotlighted
              const isLargeCard =
                layoutMode === "bento" &&
                activeCategory === "all" &&
                !searchQuery &&
                (idx === 0 || idx === 3);

              return (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: (idx % 6) * 0.05 }}
                  className={isLargeCard ? "md:col-span-2 lg:col-span-2" : "col-span-1"}
                >
                  <Link
                    href={`/collections/${col.handle}`}
                    className="group flex flex-col h-full rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)] hover:border-emerald-950/25 transition-all duration-500 overflow-hidden"
                  >
                    {/* Media Container */}
                    <div
                      className={`relative overflow-hidden bg-slate-100 ${
                        isLargeCard
                          ? "aspect-[16/10] sm:aspect-[16/9]"
                          : "aspect-[4/3] sm:aspect-[5/4]"
                      }`}
                    >
                      <Image
                        src={imageUrl(col.image.url, isLargeCard ? 1400 : 900)}
                        alt={col.image.altText ?? col.displayTitle}
                        fill
                        className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                        sizes={
                          isLargeCard
                            ? "(max-width: 768px) 100vw, 66vw"
                            : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        }
                      />

                      {/* Scrim gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-75 transition-opacity" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-bold tracking-wider">
                            CH. {col.chapterNumber}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-emerald-950 text-[11px] font-semibold tracking-wide uppercase">
                            {col.categoryLabel}
                          </span>
                        </div>

                        {col.accentBadge && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase">
                            {col.accentBadge}
                          </span>
                        )}
                      </div>

                      {/* Floating bottom arrow pill button */}
                      <div className="absolute bottom-4 right-4 z-10">
                        <div className="w-10 h-10 rounded-full bg-white/95 text-slate-900 border border-slate-200/80 shadow-md flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                          <ArrowUpRight
                            size={16}
                            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                          />
                        </div>
                      </div>

                      {/* Materials pill on image bottom-left */}
                      <div className="absolute bottom-4 left-4 z-10 max-w-[70%]">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-md text-slate-100 text-[10px] sm:text-[11px] font-medium truncate max-w-full">
                          {col.materialsTag}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 group-hover:text-emerald-900 transition-colors">
                          {col.displayTitle}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
                        {col.description}
                      </p>

                      {/* Highlights chips */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-5 mt-auto">
                        {col.highlights.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60"
                          >
                            {item}
                          </span>
                        ))}
                      </div>

                      {/* Bottom Footer CTA link */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold tracking-wider uppercase text-emerald-900 group-hover:text-emerald-700">
                        <span>EXPLORE CHAPTER</span>
                        <ChevronRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. CELEBRATION & OCCASION GUIDE */}
      <section className="bg-white border-y border-slate-200/80 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold tracking-widest uppercase mb-3">
              <Compass size={13} className="text-emerald-600" />
              CURATED BY CELEBRATION
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium text-slate-900">
              Dress for the <em>Occasion.</em>
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Whether you are clinking steins in the Schottenhamel tent or attending an Alpine
              chapel wedding, our master tailors have curated the ideal silhouette.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {OCCASIONS.map((occ) => (
              <div
                key={occ.title}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 flex flex-col justify-end min-h-[380px] p-6 border border-slate-200/60 shadow-[0_4px_25px_rgba(15,23,42,0.06)]"
              >
                <Image
                  src={occ.image}
                  alt={occ.title}
                  fill
                  className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent" />

                <div className="relative z-10">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-300 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs border border-white/10 mb-2 inline-block">
                    {occ.badge}
                  </span>

                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-white mb-2">
                    {occ.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed mb-5 line-clamp-3">
                    {occ.summary}
                  </p>

                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/collections/${occ.primaryHandle}`}
                      className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-semibold hover:bg-emerald-900 hover:text-white transition-colors"
                    >
                      <span>{occ.primaryLabel}</span>
                      <ArrowUpRight size={13} />
                    </Link>
                    <Link
                      href={`/collections/${occ.secondaryHandle}`}
                      className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/25 transition-colors"
                    >
                      <span>{occ.secondaryLabel}</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BAVARIAN ATELIER STANDARDS (Luxury Trust Strip) */}
      <section className="py-16 sm:py-20 border-b border-slate-200/80 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/5 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-950/10">
                <Scissors size={20} />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-slate-900 mb-1">
                  Wild-Tanned Leather
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Traditional birch-bark and wood-smoke tanning gives our buckskin supple resilience.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/5 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-950/10">
                <Award size={20} />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-slate-900 mb-1">
                  Authentic Staghorn & Silk
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Only real shed staghorn buttons, Austrian brocade silks, and hand-embossed relief work.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/5 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-950/10">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-slate-900 mb-1">
                  100% Fit Guarantee
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Free size consultation with our master tailors and hassle-free 30-day exchanges.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/5 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-950/10">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-slate-900 mb-1">
                  Express DHL Courier
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dispatched in garment bags with real-time tracking to your door in 2-4 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS & TRACHTEN ETIQUETTE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-800 tracking-widest uppercase flex items-center justify-center gap-1.5 mb-2">
            <HelpCircle size={14} className="text-emerald-600" />
            ATELIER SIZING & ETIQUETTE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-slate-900">
            Frequently Asked <em>Questions.</em>
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-serif text-base sm:text-lg font-medium text-slate-900 hover:text-emerald-900 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 transition-transform duration-300 ${
                      isOpen ? "rotate-90 bg-emerald-900 text-white" : ""
                    }`}
                  >
                    <ChevronRight size={14} />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-6 sm:px-6 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Concierge Banner */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#0d3b2e] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-300 block mb-1">
              NEED BESPOKE SIZING ADVICE?
            </span>
            <h3 className="font-serif text-2xl font-medium">
              Talk directly with our Bavarian fit specialists.
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-lg">
              We verify chest, waist, and inseam measurements to ensure a flawless fit for the Munich Wiesn.
            </p>
          </div>
          <Link
            href="/pages/contact"
            className="shrink-0 px-6 py-3.5 rounded-full bg-white text-emerald-950 text-xs font-bold tracking-wider uppercase hover:bg-emerald-100 transition-all shadow-md"
          >
            CONTACT CONCIERGE
          </Link>
        </div>
      </section>
    </div>
  );
}
