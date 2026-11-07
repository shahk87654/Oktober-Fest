"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { collectionHandles, journalBlogHandle } from "@/lib/config";
import { useCart } from "./cart-provider";
import { SearchOverlay } from "./search-overlay";

const navItems = [
  { title: "MEN", href: `/collections/${collectionHandles.men}`, menu: "men" },
  { title: "WOMEN", href: `/collections/${collectionHandles.women}`, menu: "women" },
  { title: "KIDS", href: `/collections/${collectionHandles.kids}` },
  { title: "ACCESSORIES", href: `/collections/${collectionHandles.accessories}` },
  { title: "COLLECTIONS", href: "/collections", menu: "collections" },
  { title: "JOURNAL", href: `/blogs/${journalBlogHandle}` },
];

export function SiteHeader({ shopifyConfigured }: { shopifyConfigured: boolean }) {
  const { cart, openCart } = useCart();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const menuContent: Record<string, Array<{ label: string; href: string }>> = {
    men: [
      { label: "The Lederhosen Edit", href: `/collections/${collectionHandles.men}` },
      { label: "Shirts & Waistcoats", href: `/collections/${collectionHandles.men}` },
      { label: "Shoes & Accessories", href: `/collections/${collectionHandles.accessories}` },
    ],
    women: [
      { label: "Dirndl Dresses", href: `/collections/${collectionHandles.women}` },
      { label: "Blouses & Jackets", href: `/collections/${collectionHandles.women}` },
      { label: "Shoes & Accessories", href: `/collections/${collectionHandles.accessories}` },
    ],
    collections: [
      { label: "Men", href: `/collections/${collectionHandles.men}` },
      { label: "Women", href: `/collections/${collectionHandles.women}` },
      { label: "Children", href: `/collections/${collectionHandles.kids}` },
      { label: "All collections", href: "/collections" },
    ],
  };

  return (
    <>
      <div className="announcement"><span>THE SEASON, IN GOOD COMPANY</span><span className="announcement-separator">—</span><span>DELIVERY RATES SHOWN AT CHECKOUT</span></div>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`} onMouseLeave={() => setActiveMenu(null)}>
        <div className="header-inner">
          <button className="icon-button mobile-menu-toggle" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Link className="wordmark" href="/" aria-label="Alpine Atelier home">
            <span className="wordmark-top">ALPINE</span><span className="wordmark-bottom">ATELIER</span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <div className="nav-item" key={item.title} onMouseEnter={() => setActiveMenu(item.menu ?? null)}>
                <Link href={item.href} onFocus={() => setActiveMenu(item.menu ?? null)} onClick={() => setActiveMenu(null)}>{item.title}{item.menu && <ChevronDown size={11} />}</Link>
              </div>
            ))}
          </nav>
          <div className="header-actions">
            <button className="icon-button search-trigger" aria-label="Search" onClick={() => setSearchOpen(true)}><Search size={19} /><span>SEARCH</span></button>
            <button className="icon-button bag-trigger" aria-label={`Open bag, ${cart?.totalQuantity ?? 0} items`} onClick={openCart}>
              <ShoppingBag size={19} /><span>BAG</span><span className="bag-count">{cart?.totalQuantity ?? 0}</span>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {activeMenu && (
            <motion.div className="mega-menu" initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -8 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} onMouseEnter={() => setActiveMenu(activeMenu)}>
              <div className="mega-menu-links">
                <span className="eyebrow">DISCOVER {activeMenu.toUpperCase()}</span>
                {menuContent[activeMenu]?.map((link) => <Link key={link.label} href={link.href} onClick={() => setActiveMenu(null)}>{link.label}<ArrowRight size={14} /></Link>)}
              </div>
              <Link className="mega-menu-feature" href={activeMenu === "women" ? `/collections/${collectionHandles.women}` : `/collections/${collectionHandles.men}`}>
                <div className={`mega-menu-image ${activeMenu}`} />
                <span>Tradition, in a new light <ArrowRight size={14} /></span>
              </Link>
              <div className="mega-menu-note"><span className="eyebrow">THE ALPINE EDIT</span><p>Pieces to be worn, remembered, and passed on.</p><Link href="/about" onClick={() => setActiveMenu(null)}>Our point of view <ArrowRight size={14} /></Link></div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav className="mobile-drawer" initial={{ x: reduceMotion ? 0 : "-100%" }} animate={{ x: 0 }} exit={{ x: reduceMotion ? 0 : "-100%" }} transition={{ duration: reduceMotion ? 0 : 0.28 }} aria-label="Mobile navigation">
            <div className="mobile-drawer-top"><span className="eyebrow">THE COLLECTIONS</span><button className="icon-button" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X size={21} /></button></div>
            {navItems.map((item, index) => item.menu ? (
              <details className="mobile-nav-group" key={item.title}>
                <summary><span className="mobile-index">0{index + 1}</span>{item.title}<ChevronDown size={17} /></summary>
                <div>{menuContent[item.menu].map((link) => <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}>{link.label}<ArrowRight size={14} /></Link>)}</div>
              </details>
            ) : (
              <Link key={item.title} href={item.href} onClick={() => setMobileOpen(false)}><span className="mobile-index">0{index + 1}</span>{item.title}<ArrowRight size={17} /></Link>
            ))}
            <div className="mobile-drawer-foot"><Link href="/about">Our story</Link><span>MADE FOR THE MOMENT</span></div>
          </motion.nav>
        )}
      </AnimatePresence>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} shopifyConfigured={shopifyConfigured} />
    </>
  );
}
