import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Mail, Ruler, Shirt, Sparkles, UsersRound } from "lucide-react";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getShopPage } from "@/lib/shopify/content";
import { ContactForm } from "@/components/contact-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  if (handle === "contact") return { title: "Contact the Atelier Concierge" };
  if (handle === "size-guide") {
    return {
      title: "Bavarian Fit & Size Guide",
      description: "How to take accurate measurements and find the right fit for Alpine Atelier garments.",
    };
  }
  if (!isShopifyConfigured()) return { title: "Information" };
  const page = await getShopPage(handle);
  return page
    ? { title: page.seo.title || page.title, description: page.seo.description || undefined }
    : { title: "Page not found" };
}

export default async function ShopifyPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  if (handle === "contact") {
    return (
      <main className="contact-page">
        <div className="cart-breadcrumb">
          <Link href="/" className="hover:text-emerald-800">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Atelier Concierge</span>
        </div>

        <header className="contact-hero mb-8">
          <div className="contact-hero-copy">
            <span className="eyebrow">
              <i /> CLIENT CONCIERGE &amp; INQUIRIES
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium mt-3 mb-3 text-slate-900">
              We are here to <em>assist you.</em>
            </h1>
            <p className="text-slate-600 text-base max-w-md">
              Have questions regarding garment sizing, custom embroidery, or express courier delivery for Oktoberfest 2026? Send our concierge team a note.
            </p>
          </div>
        </header>

        <div className="contact-content">
          <section className="contact-form-panel" aria-labelledby="contact-form-title">
            <div className="contact-panel-heading">
              <span className="eyebrow">
                <i /> DIRECT ATELIER DESK
              </span>
              <h2 id="contact-form-title" className="font-serif text-2xl sm:text-3xl font-medium mt-2 mb-2">
                Send us a message.
              </h2>
              <p className="text-slate-500 text-sm">
                Share a few details below and a master tailor or stylist will respond promptly.
              </p>
            </div>
            <ContactForm shopDomain={process.env.SHOPIFY_STORE_DOMAIN ?? ""} />
          </section>

          <aside className="contact-aside">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <Mail size={18} />
              </div>
              <span className="eyebrow text-[10px]">
                <i /> QUICK RESOURCES
              </span>
              <h2 className="font-serif text-xl font-medium mt-1 mb-2">Looking for specific information?</h2>
              <p className="text-xs text-slate-500 mb-0">Our dedicated resource guides may already answer your question:</p>
            </div>

            <Link className="contact-resource-link" href="/pages/size-guide">
              <span>
                <small>FIT &amp; MEASUREMENTS</small>
                <strong>Bavarian Size Guide</strong>
              </span>
              <ArrowUpRight size={18} className="text-emerald-700" />
            </Link>

            <Link className="contact-resource-link" href="/policies/shipping-policy">
              <span>
                <small>COURIER DISPATCH</small>
                <strong>Shipping &amp; Delivery Information</strong>
              </span>
              <ArrowUpRight size={18} className="text-emerald-700" />
            </Link>

            <Link className="contact-resource-link" href="/policies/refund-policy">
              <span>
                <small>PEACE OF MIND</small>
                <strong>30-Day Returns &amp; Exchanges</strong>
              </span>
              <ArrowUpRight size={18} className="text-emerald-700" />
            </Link>
          </aside>
        </div>
      </main>
    );
  }

  if (handle === "size-guide") {
    return (
      <main className="size-guide-page">
        <div className="cart-breadcrumb">
          <Link href="/" className="hover:text-emerald-800">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Size Guide</span>
        </div>

        <header className="size-guide-hero mb-8">
          <span className="eyebrow">
            <i /> TAILORED PRECISION
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-medium mt-3 mb-3 text-slate-900">
            Find your <em>exact measure.</em>
          </h1>
          <p className="text-slate-600 text-base max-w-lg mb-4">
            Traditional Bavarian garments are designed to fit with tailored distinction. Follow our measurement advice below to select your ideal size.
          </p>
        </header>

        <section className="size-guide-measurements" aria-label="Measurement instructions">
          <article className="size-guide-measurement">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
              <Ruler size={18} />
            </div>
            <h3 className="font-serif text-2xl font-medium text-slate-900">01 / Chest &amp; Bust</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Measure around the fullest part of your chest or bust, keeping the measuring tape comfortably level under arms.
            </p>
          </article>

          <article className="size-guide-measurement">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
              <Ruler size={18} />
            </div>
            <h3 className="font-serif text-2xl font-medium text-slate-900">02 / Natural Waist</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Measure around your natural waistline—the narrowest point above your navel. Stand relaxed without holding breath.
            </p>
          </article>

          <article className="size-guide-measurement">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
              <Ruler size={18} />
            </div>
            <h3 className="font-serif text-2xl font-medium text-slate-900">03 / Hips &amp; Seat</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              With feet placed together, measure around the fullest circumference of your hips and seat for lederhosen cut.
            </p>
          </article>
        </section>

        <section className="size-guide-fit-cards">
          <article>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <Shirt size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 m-0">Dirndl Bodices</h3>
                <p className="text-xs text-slate-500 m-0">Select based on bust &amp; underbust dimensions.</p>
              </div>
            </div>
            <Link href="/collections/women" className="text-emerald-800 font-bold text-xs inline-flex items-center gap-1 hover:underline">
              <span>Shop Women</span>
              <ArrowRight size={13} />
            </Link>
          </article>

          <article>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <Shirt size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 m-0">Lederhosen</h3>
                <p className="text-xs text-slate-500 m-0">Natural leather expands slightly with wear.</p>
              </div>
            </div>
            <Link href="/collections/men" className="text-emerald-800 font-bold text-xs inline-flex items-center gap-1 hover:underline">
              <span>Shop Men</span>
              <ArrowRight size={13} />
            </Link>
          </article>

          <article>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <UsersRound size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 m-0">Children&apos;s Sizing</h3>
                <p className="text-xs text-slate-500 m-0">Choose based on height and current chest size.</p>
              </div>
            </div>
            <Link href="/collections/kids" className="text-emerald-800 font-bold text-xs inline-flex items-center gap-1 hover:underline">
              <span>Shop Kids</span>
              <ArrowRight size={13} />
            </Link>
          </article>
        </section>

        <section className="size-guide-help">
          <span className="eyebrow">
            <i /> NEED PERSONAL MEASUREMENT ADVICE?
          </span>
          <h2 className="font-serif text-3xl font-medium mt-2 mb-3">
            Our atelier tailors are glad to <em>assist you.</em>
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Send us your measurements and the specific style you have in mind. We will confirm the optimal fit.
          </p>
          <Link className="button button-dark inline-flex items-center gap-2" href="/pages/contact">
            <span>ASK ATELIER CONCIERGE</span>
            <ArrowRight size={15} />
          </Link>
        </section>
      </main>
    );
  }

  if (!isShopifyConfigured()) {
    return (
      <main className="store-setup flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="eyebrow">
          <i /> ATELIER INFORMATION
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium mt-3 text-slate-900">
          Details <em>await.</em>
        </h1>
      </main>
    );
  }

  const page = await getShopPage(handle);
  if (!page) notFound();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="cart-breadcrumb mb-6">
        <Link href="/" className="hover:text-emerald-800">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{page.title}</span>
      </div>
      <span className="eyebrow">
        <i /> ALPINE ATELIER
      </span>
      <h1 className="font-serif text-4xl sm:text-5xl font-medium text-slate-900 mt-2 mb-8">
        {page.title}
      </h1>
      <article
        className="prose prose-slate prose-lg max-w-none leading-relaxed text-slate-700"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </main>
  );
}
