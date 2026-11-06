"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { AnnouncementBar } from "@/components/announcement-bar";

const navigation = [
  { title: "Men", href: "/collections/men", links: ["Lederhosen", "Bundhosen", "Jackets", "Vests", "Shirts", "Shoes"] },
  { title: "Women", href: "/collections/women", links: ["Dirndl", "Cardigans & Jackets", "Blouses", "Lederhosen", "Shoes"] },
  { title: "Kids", href: "/collections/kids", links: ["Kids Lederhosen", "Kids Shirts", "Kids Dirndl"] },
  { title: "Accessories", href: "/collections/accessories", links: ["Hats", "Belts", "Suspenders", "Socks", "T-Shirts"] },
  { title: "Materials", href: "/pages/materials", links: ["Cowskin", "Goatskin", "Deerskin", "Cotton", "Silk", "Wool"] },
  { title: "Magazine", href: "/blogs/news", links: ["Style notes", "Bavarian stories", "The Wiesn guide"] },
];
const collectionHandles: Record<string, string> = {
  "Men:Lederhosen": "lederhosen-men",
  "Men:Jackets": "trachten-jackets",
  "Men:Vests": "vest",
  "Men:Shirts": "trachten-shirts",
  "Women:Cardigans & Jackets": "women-jackets-sweaters",
  "Women:Blouses": "blouses",
  "Women:Lederhosen": "lederhosen-women",
  "Women:Shoes": "dirndl-shoes",
  "Kids:Kids Lederhosen": "lederhosen-kids",
  "Kids:Kids Shirts": "kids-shirts",
  "Kids:Kids Dirndl": "dirndl-kids",
  "Accessories:Hats": "hats",
  "Accessories:Belts": "belts",
  "Accessories:Suspenders": "suspender",
  "Accessories:Socks": "trachten-socks",
  "Accessories:T-Shirts": "oktoberfest-t-shirts",
};

export function SiteHeader({
  initialCount = 0,
  announcement,
  shopName = "Wiesn Atelier",
  shopLogo,
}: {
  initialCount?: number;
  announcement?: { firstMessage?: string; secondMessage?: string };
  shopName?: string;
  shopLogo?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(initialCount);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const update = (event: Event) => {
      const cart = (event as CustomEvent<{ totalQuantity: number }>).detail;
      if (cart) setCartCount(cart.totalQuantity);
    };
    window.addEventListener("wiesn:cart-updated", update);
    return () => window.removeEventListener("wiesn:cart-updated", update);
  }, []);

  return (
    <>
      <AnnouncementBar firstMessage={announcement?.firstMessage} secondMessage={announcement?.secondMessage} />
      <header className="site-header">
        <div className="header-inner page-shell">
          <button className="icon-button mobile-menu-trigger" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Link className="brand-mark" href="/" aria-label={`${shopName} home`}>
            {shopLogo ? <Image className="brand-mark__logo" src={shopLogo} alt="" width={148} height={48} priority /> : <span className="brand-mark__crest" aria-hidden="true">✳</span>}
            <span className="brand-mark__name">{shopName}</span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <div className="nav-item" key={item.title}>
                <Link href={item.href} className="nav-link">{item.title}</Link>
                <div className="mega-menu">
                  <p className="eyebrow">{item.title} collection</p>
                  <div className="mega-menu__links">
                    {item.links.map((link) => {
                      const href = item.title === "Materials"
                        ? `/pages/${link.toLowerCase().replaceAll(" ", "-")}`
                        : item.title === "Magazine"
                          ? "/blogs/news"
                          : `/collections/${collectionHandles[`${item.title}:${link}`] ?? link.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-")}`;
                      return <Link key={link} href={href} className="mega-menu__link">{link}<span aria-hidden="true">↗</span></Link>;
                    })}
                  </div>
                  <p className="mega-menu__note display">Made for the<br />long way home.</p>
                </div>
              </div>
            ))}
          </nav>
          <div className="header-actions">
            <form action="/search" className={`search-form${searchOpen ? " search-form--open" : ""}`}>
              <Search size={16} aria-hidden="true" />
              <input name="q" aria-label="Search products" placeholder="Search..." onBlur={() => setSearchOpen(false)} />
            </form>
            <button type="button" className="icon-button search-trigger" aria-label="Open search" onClick={() => setSearchOpen(true)}><Search size={19} /></button>
            <a className="header-phone" href="tel:+18005550184">+1 800 555 0184</a>
            <Link className="header-account" href="/account">Account</Link>
            <Link className="cart-link" href="/cart" aria-label={`Cart, ${cartCount} items`}>
              <ShoppingBag size={19} aria-hidden="true" /><span>Cart</span><b aria-live="polite">{cartCount}</b>
            </Link>
          </div>
        </div>
        <div className={`mobile-menu${menuOpen ? " mobile-menu--open" : ""}`} aria-hidden={!menuOpen} inert={!menuOpen}>
          <nav aria-label="Mobile navigation">
            {navigation.map((item, index) => (
              <Link key={item.title} href={item.href} style={{ ["--menu-index" as string]: index }} onClick={() => setMenuOpen(false)}>
                <span>{item.title}</span><span aria-hidden="true">↗</span>
              </Link>
            ))}
            <Link href="/account" onClick={() => setMenuOpen(false)}>My account <span aria-hidden="true">↗</span></Link>
            <a href="tel:+18005550184">Call us <span aria-hidden="true">↗</span></a>
          </nav>
          <p>Grüß Gott. Stay a little.</p>
        </div>
      </header>
      <style>{`
        .site-header { position: sticky; top: 0; z-index: 40; background: rgba(246,240,228,.97); border-bottom: 1px dashed rgba(122,74,37,.4); backdrop-filter: blur(14px); }
        .header-inner { display:flex; min-height:74px; align-items:center; justify-content:space-between; gap:1.2rem; }
        .brand-mark { display:flex; flex:0 0 auto; align-items:center; gap:.45rem; font-size:14px; font-weight:800; letter-spacing:.12em; }
        .brand-mark__crest { display:grid; width:29px; height:29px; place-items:center; border-radius:50%; background:var(--hops); color:var(--gold); font-size:17px; }
        .brand-mark__name { max-width:170px; font-size:11px; line-height:1.15; text-transform:uppercase; }
        .brand-mark__logo { width:auto; max-width:148px; height:auto; max-height:44px; object-fit:contain; }
        .desktop-nav { display:flex; height:74px; align-items:center; gap:clamp(.65rem,1.35vw,1.5rem); }
        .nav-item { height:100%; display:flex; align-items:center; }
        .nav-link { position:relative; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }
        .nav-link::after { position:absolute; right:0; bottom:-7px; left:0; height:1px; content:""; background:var(--gold); transform:scaleX(0); transform-origin:left; transition:transform .2s; }
        .nav-item:hover .nav-link::after,.nav-item:focus-within .nav-link::after { transform:scaleX(1); }
        .mega-menu { position:absolute; top:100%; left:0; display:grid; width:100%; grid-template-columns:1fr 2fr 1fr; gap:3rem; padding:2.5rem max(calc((100vw - 1200px)/2), 3rem); background:var(--cream); border-bottom:1px dashed var(--pretzel); opacity:0; visibility:hidden; transform:translateY(-8px); transition:.18s; }
        .nav-item:hover .mega-menu,.nav-item:focus-within .mega-menu { opacity:1; visibility:visible; transform:translateY(0); }
        .mega-menu__links { display:grid; grid-template-columns:repeat(2,minmax(120px,1fr)); gap:.8rem 2rem; }
        .mega-menu__link { display:flex; justify-content:space-between; font-size:13px; }
        .mega-menu__link span { color:var(--pretzel); opacity:0; transition:opacity .2s; }
        .mega-menu__link:hover span { opacity:1; }
        .mega-menu__note { margin:0; color:var(--hops); font-size:2rem; line-height:1; }
        .header-actions { display:flex; align-items:center; gap:1rem; }
        .icon-button { display:grid; width:40px; height:40px; place-items:center; border:0; background:transparent; cursor:pointer; }
        .search-form { display:flex; width:38px; height:38px; align-items:center; overflow:hidden; gap:.5rem; border:1px solid transparent; border-radius:99px; padding:0 .6rem; transition:width .2s,border-color .2s; }
        .search-form:focus-within { width:160px; border-color:var(--line); }
        .search-form input { width:100px; border:0; outline:0; background:transparent; font-size:12px; }
        .search-form input::placeholder { color:var(--muted); }
        .header-phone,.header-account { font-size:10px; font-weight:600; }
        .cart-link { display:flex; align-items:center; gap:.4rem; font-size:10px; font-weight:700; }
        .cart-link b { display:grid; width:20px; height:20px; place-items:center; border-radius:50%; background:var(--gold); font-size:10px; }
        .mobile-menu-trigger,.search-trigger,.mobile-menu { display:none; }
        @media(max-width:1100px) { .header-phone,.header-account { display:none; } .desktop-nav { gap:.7rem; } .nav-link {font-size:9px;} }
        @media(max-width:800px) {
          .header-inner { min-height:64px; }
          .mobile-menu-trigger,.search-trigger { display:grid; }
          .desktop-nav,.search-form { display:none; }
          .header-actions { gap:.35rem; }
          .mobile-menu { position:fixed; z-index:39; inset:64px 0 0; display:flex; visibility:hidden; flex-direction:column; justify-content:space-between; padding:2rem 24px 3rem; background:var(--cream); opacity:0; transform:translateY(-12px); transition:.25s; }
          .mobile-menu--open { visibility:visible; opacity:1; transform:none; }
          .mobile-menu nav { display:flex; flex-direction:column; }
          .mobile-menu nav a { display:flex; align-items:center; justify-content:space-between; border-bottom:1px dashed var(--line); padding:1rem 0; font-family:var(--font-display); font-size:clamp(2rem,10vw,3rem); animation:enter .35s both; animation-delay:calc(var(--menu-index,6)*35ms); }
          .mobile-menu nav a span+span { color:var(--gold); font-family:var(--font-ui); font-size:1.2rem; }
          .mobile-menu p { font-family:var(--font-display); font-size:1.3rem; color:var(--hops); }
          @keyframes enter { from {opacity:0;transform:translateY(8px)} to {opacity:1;transform:none} }
        }
        @media(prefers-reduced-motion:reduce) { .mobile-menu nav a { animation:none; } }
      `}</style>
    </>
  );
}
