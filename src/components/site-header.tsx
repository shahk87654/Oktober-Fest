"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { collectionHandles, journalBlogHandle } from "@/lib/config";
import { useCart } from "./cart-provider";
import { SearchOverlay } from "./search-overlay";

const navItems = [
  { title: "Men", href: `/collections/${collectionHandles.men}`, menu: "men" },
  { title: "Women", href: `/collections/${collectionHandles.women}`, menu: "women" },
  { title: "Kids", href: `/collections/${collectionHandles.kids}` },
  { title: "Accessories", href: `/collections/${collectionHandles.accessories}` },
  { title: "Collections", href: "/collections", menu: "collections" },
  { title: "Journal", href: `/blogs/${journalBlogHandle}` },
];

export function SiteHeader({ shopifyConfigured }: { shopifyConfigured: boolean }) {
  const { cart, openCart } = useCart();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menuContent: Record<string, Array<{ label: string; href: string; note: string }>> = {
    men: [
      { label: "The Lederhosen Edit", href: `/collections/${collectionHandles.men}`, note: "Handcrafted Bavarian deerskin & leather" },
      { label: "Traditional Shirts & Waistcoats", href: `/collections/${collectionHandles.men}`, note: "Linen, crisp cotton & embroidered vests" },
      { label: "Shoes, Belts & Trachten Accessories", href: `/collections/${collectionHandles.accessories}`, note: "Haferlschuhe, woolen socks & charms" },
    ],
    women: [
      { label: "Dirndl Dresses", href: `/collections/${collectionHandles.women}`, note: "Silk, jacquard & bespoke festive dirndls" },
      { label: "Lace Blouses & Velvet Bodices", href: `/collections/${collectionHandles.women}`, note: "High-neck lace & handcrafted buttons" },
      { label: "Aprons, Cardigans & Jewelry", href: `/collections/${collectionHandles.accessories}`, note: "Traditional ribbons, velvet chokers & pins" },
    ],
    collections: [
      { label: "Men's Bavarian Wardrobe", href: `/collections/${collectionHandles.men}`, note: "Classic & contemporary silhouettes" },
      { label: "Women's Trachten Haute Couture", href: `/collections/${collectionHandles.women}`, note: "Festive dirndls & modern elegance" },
      { label: "Children & Family Keepsakes", href: `/collections/${collectionHandles.kids}`, note: "Pieces for the little ones" },
      { label: "All Collections Index", href: "/collections", note: "Browse complete atelier catalog" },
    ],
  };

  return (
    <>
      <div className="announcement">
        <span className="flex items-center gap-2">
          <Sparkles size={12} className="text-emerald-300 animate-pulse" />
          <span>OKTOBERFEST 2026 COUTURE EDIT</span>
        </span>
        <span className="announcement-separator">•</span>
        <span>EXPRESS WORLDWIDE COURIER DELIVERY AVAILABLE</span>
      </div>

      <header
        className={`site-header ${scrolled ? "is-scrolled" : ""}`}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="header-inner">
          <button
            className="icon-button mobile-menu-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link className="wordmark" href="/" aria-label="Alpine Atelier home">
            <span className="wordmark-top">ALPINE ATELIER</span>
            <span className="wordmark-bottom">BAVARIA 1898 • MODERN EDIT</span>
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <div
                className="nav-item"
                key={item.title}
                onMouseEnter={() => setActiveMenu(item.menu ?? null)}
              >
                <Link
                  href={item.href}
                  onFocus={() => setActiveMenu(item.menu ?? null)}
                  onClick={() => setActiveMenu(null)}
                >
                  {item.title}
                  {item.menu && <ChevronDown size={12} />}
                </Link>
              </div>
            ))}
          </nav>

          <div className="header-actions">
            <button
              className="icon-button search-trigger"
              aria-label="Search collection"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} />
              <span className="hidden sm:inline">Search</span>
            </button>

            <button
              className="icon-button bag-trigger"
              aria-label={`Open bag, ${cart?.totalQuantity ?? 0} items`}
              onClick={openCart}
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Bag</span>
              <span className="bag-count">{cart?.totalQuantity ?? 0}</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {activeMenu && (
            <motion.div
              className="mega-menu"
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -10 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setActiveMenu(activeMenu)}
            >
              <div className="mega-menu-links">
                <span className="eyebrow">
                  <i /> EXPLORE {activeMenu.toUpperCase()}
                </span>
                {menuContent[activeMenu]?.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setActiveMenu(null)}
                    className="group"
                  >
                    <div>
                      <div>{link.label}</div>
                      <p className="text-xs text-slate-500 font-normal m-0 mt-0.5">{link.note}</p>
                    </div>
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>

              <Link
                className="mega-menu-feature group"
                href={activeMenu === "women" ? `/collections/${collectionHandles.women}` : `/collections/${collectionHandles.men}`}
                onClick={() => setActiveMenu(null)}
              >
                <div className={`mega-menu-image ${activeMenu}`} />
                <span>
                  <span>The 2026 Alpine Haute Collection</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>

              <div className="mega-menu-note">
                <span className="eyebrow">
                  <i /> ATELIER MANIFESTO
                </span>
                <p>Heirloom craftsmanship refined for contemporary life.</p>
                <Link
                  href="/about"
                  onClick={() => setActiveMenu(null)}
                  className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-bold text-xs tracking-wider"
                >
                  Our heritage story <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="drawer-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              className="mobile-drawer"
              initial={{ x: reduceMotion ? 0 : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: reduceMotion ? 0 : "-100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
              aria-label="Mobile navigation"
            >
              <div className="mobile-drawer-top">
                <span className="eyebrow">
                  <i /> ALPINE ATELIER
                </span>
                <button
                  className="icon-button"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={22} />
                </button>
              </div>

              {navItems.map((item, index) =>
                item.menu && menuContent[item.menu] ? (
                  <details className="mobile-nav-group" key={item.title}>
                    <summary>
                      <span className="mobile-index">0{index + 1}</span>
                      <span>{item.title}</span>
                      <ChevronDown size={18} />
                    </summary>
                    <div>
                      {menuContent[item.menu].map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                        >
                          <span>{link.label}</span>
                          <ArrowRight size={14} />
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="mobile-index">0{index + 1}</span>
                    <span>{item.title}</span>
                    <ArrowRight size={18} />
                  </Link>
                ),
              )}

              <div className="mobile-drawer-foot">
                <Link href="/about" onClick={() => setMobileOpen(false)}>
                  Our Heritage Story
                </Link>
                <span className="text-slate-400 font-bold tracking-widest text-[10px]">
                  OKTOBERFEST 2026
                </span>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        shopifyConfigured={shopifyConfigured}
      />
    </>
  );
}
