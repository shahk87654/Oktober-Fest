import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Mail, Ruler, Shirt, UsersRound } from "lucide-react";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getShopPage } from "@/lib/shopify/content";
import { ContactForm } from "@/components/contact-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  if (handle === "contact") return { title: "Contact the atelier" };
  if (handle === "size-guide") return {
    title: "Size guide",
    description: "How to take your measurements and find the right fit for Alpine Atelier pieces.",
  };
  if (!isShopifyConfigured()) return { title: "Information" };
  const page = await getShopPage(handle);
  return page ? { title: page.seo.title || page.title, description: page.seo.description || undefined } : { title: "Page not found" };
}

export default async function ShopifyPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (handle === "contact") {
    return (
      <main className="contact-page">
        <div className="contact-breadcrumb"><Link href="/">HOME</Link><span>/</span><span>CONTACT</span></div>
        <header className="contact-hero">
          <div className="contact-hero-copy">
            <span className="eyebrow">A NOTE TO THE ATELIER / WE&apos;RE HERE TO HELP</span>
            <h1>Let&apos;s make<br /><em>it a little easier.</em></h1>
            <p>Questions about a piece, finding your fit, or an order? Send us a note and we&apos;ll be glad to help.</p>
          </div>
          <span className="contact-hero-mark" aria-hidden="true">A</span>
          <span className="contact-hero-index">ALPINE ATELIER <i /> CUSTOMER CARE</span>
        </header>
        <div className="contact-content">
          <section className="contact-form-panel" aria-labelledby="contact-form-title">
            <div className="contact-panel-heading">
              <span className="eyebrow">WE&apos;RE LISTENING</span>
              <h2 id="contact-form-title">Send us<br /><em>a little note.</em></h2>
              <p>Share a few details below so we can point you in the right direction.</p>
            </div>
            <ContactForm shopDomain={process.env.SHOPIFY_STORE_DOMAIN ?? ""} />
          </section>
          <aside className="contact-aside">
            <div className="contact-aside-intro">
              <span className="contact-aside-icon"><Mail size={18} strokeWidth={1.5} /></span>
              <span className="eyebrow">A GOOD PLACE TO START</span>
              <h2>Looking for<br /><em>something specific?</em></h2>
              <p>These pages may have the details you&apos;re after.</p>
            </div>
            <Link className="contact-resource-link" href="/pages/size-guide"><span><small>01 / FIT & MEASUREMENTS</small><strong>Size guide</strong></span><ArrowUpRight size={17} /></Link>
            <Link className="contact-resource-link" href="/policies/shipping-policy"><span><small>02 / DELIVERY DETAILS</small><strong>Shipping information</strong></span><ArrowUpRight size={17} /></Link>
            <Link className="contact-resource-link" href="/policies/refund-policy"><span><small>03 / RETURNS & REFUNDS</small><strong>Returns policy</strong></span><ArrowUpRight size={17} /></Link>
            <div className="contact-aside-note"><span>FROM THE ALPS, WITH CARE</span><p>Every question is welcome. Tell us what you need and we&apos;ll take it from there.</p></div>
          </aside>
        </div>
      </main>
    );
  }
  if (handle === "size-guide") {
    return (
      <main className="size-guide-page">
        <div className="size-guide-breadcrumb"><Link href="/">HOME</Link><span>/</span><span>SIZE GUIDE</span></div>
        <header className="size-guide-hero">
          <span className="eyebrow">A MORE PERSONAL FIT / THE SIZE GUIDE</span>
          <h1>Find your<br /><em>right measure.</em></h1>
          <p>Take a moment with the tape, then use the measurements and fit notes listed on each piece to choose your size.</p>
          <a href="#measurements" className="size-guide-scroll">HOW TO MEASURE <ArrowRight size={14} /></a>
        </header>

        <section className="size-guide-intro" id="measurements" aria-labelledby="size-guide-intro-title">
          <div className="size-guide-intro-icon"><Ruler size={21} strokeWidth={1.5} /></div>
          <div>
            <span className="eyebrow">BEFORE YOU BEGIN</span>
            <h2 id="size-guide-intro-title">A good fit starts<br /><em>with good notes.</em></h2>
          </div>
          <p>Use a soft measuring tape over light clothing. Keep it comfortably level—not pulled tight—and record each measurement. Compare your numbers with the size details on the product page, since fit can vary by style.</p>
        </section>

        <section className="size-guide-measurements" aria-label="Measurement instructions">
          <article className="size-guide-measurement">
            <span className="size-guide-number">01</span>
            <span className="size-guide-measure-icon"><Ruler size={18} /></span>
            <h3>Chest</h3>
            <p>Measure around the fullest part of the chest, keeping the tape level across the back.</p>
            <span className="size-guide-hint">KEEP THE TAPE LEVEL</span>
          </article>
          <article className="size-guide-measurement">
            <span className="size-guide-number">02</span>
            <span className="size-guide-measure-icon"><Ruler size={18} /></span>
            <h3>Waist</h3>
            <p>Measure around your natural waist—the crease your body makes when you bend to one side.</p>
            <span className="size-guide-hint">STAND COMFORTABLY</span>
          </article>
          <article className="size-guide-measurement">
            <span className="size-guide-number">03</span>
            <span className="size-guide-measure-icon"><Ruler size={18} /></span>
            <h3>Hips</h3>
            <p>With feet together, measure around the fullest part of your hips and seat.</p>
            <span className="size-guide-hint">CHECK FRONT AND BACK</span>
          </article>
        </section>

        <section className="size-guide-fit-section">
          <div className="size-guide-fit-heading">
            <span className="eyebrow">SIZING, BY STYLE</span>
            <h2>Every piece has<br /><em>its own character.</em></h2>
            <p>Traditional silhouettes and modern cuts can fit differently. Use the measurements and fit notes on the individual product page as your guide.</p>
          </div>
          <div className="size-guide-fit-cards">
            <article>
              <span><Shirt size={19} strokeWidth={1.5} /></span>
              <div><h3>Dirndls & dresses</h3><p>Start with your bust, waist, and hip measurements. Check the product details for the specific fit and available size options.</p></div>
              <Link href="/collections/women" aria-label="Shop women's styles"><ArrowRight size={16} /></Link>
            </article>
            <article>
              <span><Shirt size={19} strokeWidth={1.5} /></span>
              <div><h3>Lederhosen & shirts</h3><p>Compare your waist and hip measurements with the product sizing notes. Check each style’s details for its cut and fit.</p></div>
              <Link href="/collections/men" aria-label="Shop men's styles"><ArrowRight size={16} /></Link>
            </article>
            <article>
              <span><UsersRound size={19} strokeWidth={1.5} /></span>
              <div><h3>Children&apos;s styles</h3><p>Use your child’s current measurements and the size information on the product page. Age alone may not indicate the best fit.</p></div>
              <Link href="/collections/kids" aria-label="Shop children's styles"><ArrowRight size={16} /></Link>
            </article>
          </div>
        </section>

        <section className="size-guide-help">
          <span className="eyebrow">STILL NOT SURE?</span>
          <h2>We&apos;re happy<br /><em>to help you find your fit.</em></h2>
          <p>Send us the style you have in mind and your measurements. Our team can help you review the product’s fit details.</p>
          <Link className="button button-dark" href="/pages/contact">ASK THE ATELIER <ArrowRight size={15} /></Link>
        </section>
      </main>
    );
  }
  if (!isShopifyConfigured()) return <main className="store-setup"><span className="eyebrow">FROM THE ATELIER</span><h1>Useful details,<br /><em>beautifully clear.</em></h1><p>Pages are managed directly through Shopify Admin.</p></main>;
  const page = await getShopPage(handle);
  if (!page) notFound();
  return <main className="content-page policy-page"><span className="eyebrow">ALPINE ATELIER / INFORMATION</span><h1>{page.title}</h1><article dangerouslySetInnerHTML={{ __html: page.body }} /></main>;
}
