import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { getMetaobjects, getPage } from "@/lib/shopify/storefront";
import { shopifyConfigured } from "@/lib/env";
import { sanitizeShopifyHtml } from "@/lib/html";
import Image from "next/image";

type Props = { params: Promise<{ handle: string }> };

const pages: Record<string, { title: string; intro: string; body: string }> = {
  about: {
    title: "A little about us",
    intro: "Bavarian roots. A modern point of view. A place at the table for everyone.",
    body: "Wiesn Atelier is for people who love the feeling of getting together. We take our cues from Bavarian tradition and make room for the way we celebrate now: with thoughtful details, honest materials and clothes that are a pleasure to wear again. Our team believes good service should feel as warm as a welcome at the door. If you have a question about fit, materials or an order, we would love to hear from you.",
  },
  contact: {
    title: "Say Servus",
    intro: "A real person is ready to help.",
    body: "For sizing advice, order questions or a little more about the materials, write to servus@wiesnatelier.com. We aim to reply within two business days. US: +1 800 555 0184. UK: +44 20 8012 3456.",
  },
  faqs: {
    title: "Frequently asked questions",
    intro: "The useful details, all in one place.",
    body: "Eligible, unworn items may be returned within 14 days of delivery. Custom-made and final-sale items are not returnable unless faulty. Shipping options and duties are shown at checkout. For fit help, use our size guide or write to servus@wiesnatelier.com.",
  },
  materials: {
    title: "Materials, with a little more meaning",
    intro: "Good materials make a difference you can feel.",
    body: "Leather develops a character all its own. Cowhide is known for durability, goatskin for a lighter feel and deerskin for supple softness. Natural variation is part of the material, not a flaw. Keep leather dry, let it air after wearing and follow the care instructions supplied with your garment. For cotton, silk, wool and velvet, check the garment label before cleaning.",
  },
  "size-guide": {
    title: "Find your fit",
    intro: "A good fit should let you enjoy the whole evening.",
    body: "Use the product size chart and compare the measurements with a similar garment you own. Measure over light clothing and keep the tape comfortably snug. If you are between sizes, we recommend choosing the larger size. If you share exact measurements with an order, our team will confirm your fit by email before dispatch.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const page = shopifyConfigured ? await getPage(handle) : null;
  const fallback = pages[handle];
  if (!page && !fallback && shopifyConfigured) notFound();
  return {
    title: page?.seo.title ?? page?.title ?? fallback?.title ?? "About",
    description: page?.seo.description ?? page?.bodySummary ?? fallback?.intro,
    alternates: { canonical: `/pages/${handle}` },
  };
}

export default async function ContentPage({ params }: Props) {
  const { handle } = await params;
  const page = shopifyConfigured ? await getPage(handle) : null;
  const materials = handle === "materials" && shopifyConfigured
    ? await getMetaobjects<{ id: string; handle: string; name?: string; description?: string; texture_image_url?: string; care?: string; durability?: string }>("material", 12)
    : [];
  const fallback = pages[handle];
  if (!page && !fallback && shopifyConfigured) notFound();
  const title = page?.title ?? fallback?.title ?? handle.replaceAll("-", " ");
  const intro = page?.bodySummary ?? fallback?.intro ?? "";
  const body = page?.body ? sanitizeShopifyHtml(page.body) : fallback?.body ?? "";
  const faqData = handle === "faqs" ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What is your return policy?", acceptedAnswer: { "@type": "Answer", text: "Eligible, unworn items may be returned within 14 days of delivery. Custom-made and final-sale items are not returnable unless faulty." } },
      { "@type": "Question", name: "How do I choose my size?", acceptedAnswer: { "@type": "Answer", text: "Use the product size chart and compare measurements. If between sizes, choose the larger size." } },
    ],
  } : null;
  return (
    <article className="page-shell content-page">
      {faqData && <JsonLd data={faqData} />}
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{title}</span></nav>
      <p className="eyebrow">Wiesn Atelier</p><h1 className="display">{title}</h1><p className="content-intro">{intro}</p>
      {body && <div className="content-body" dangerouslySetInnerHTML={{ __html: body }} />}
      {handle === "contact" && <a className="button-primary" href="mailto:servus@wiesnatelier.com?subject=Hello%20Wiesn%20Atelier">Write us a note</a>}
      {handle === "size-guide" && <Link className="button-secondary" href="/collections/lederhosen-men">Find a piece to try on</Link>}
      {materials.length > 0 && <div className="material-explorer">{materials.map((material) => {
        const textureImage = safeShopifyImageUrl(material.texture_image_url);
        return <article key={material.id}><div className="material-image">{textureImage && <Image src={textureImage} alt={`${material.name ?? material.handle} texture detail`} fill sizes="(max-width:650px) 90vw, 30vw" />}</div><h2 className="display">{material.name ?? material.handle}</h2><p>{material.description}</p><p>{material.durability}</p><details><summary>Care notes</summary><p>{material.care}</p></details></article>;
      })}</div>}
      {handle === "materials" && <div className="material-links">{["cow-leather", "goat-leather", "deer-leather", "cotton-fabric", "silk-fabric", "wool-fabric"].map((item) => <Link key={item} href={`/pages/${item}`}>{item.replace("-", " ")}</Link>)}</div>}
      <style>{`
        .content-page { min-height:55vh; padding-block:1rem 6rem; }.breadcrumbs { display:flex; gap:.6rem; margin-bottom:3rem; font-size:.68rem; }.breadcrumbs span { color:var(--muted); }
        .content-page>.eyebrow { color:var(--pretzel); }.content-page h1 { max-width:900px; margin:.6rem 0 1rem; font-size:clamp(3.2rem,8vw,7rem); line-height:.94; text-transform:capitalize; }
        .content-intro { max-width:700px; margin:0 0 2rem; color:var(--hops); font-family:var(--font-display); font-size:clamp(1.2rem,2.4vw,1.8rem); line-height:1.35; }
        .content-body { max-width:780px; color:#4e524a; font-size:.9rem; line-height:1.9; }.content-body h2 { margin-top:2rem; color:var(--forest); font-family:var(--font-display); font-size:2rem; }.content-body a { text-decoration:underline; text-decoration-color:var(--gold); }
        .material-explorer { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-top:2rem; }.material-explorer article { border:1px dashed var(--pretzel); border-radius:12px; padding:.75rem; }.material-image { position:relative; aspect-ratio:4/3; overflow:hidden; border-radius:8px; background:#e9e3d6; }.material-image img { object-fit:cover; }.material-explorer h2 { margin:.8rem 0 .4rem; font-size:1.35rem; text-transform:capitalize; }.material-explorer article>p,.material-explorer details { color:var(--muted); font-size:.7rem; line-height:1.6; }.material-explorer summary { cursor:pointer; color:var(--forest); }
        @media(max-width:650px) { .material-explorer { grid-template-columns:1fr; } }
        .content-page>.button-primary,.content-page>.button-secondary { margin-top:1.3rem; }.material-links { display:flex; flex-wrap:wrap; gap:.7rem; margin-top:2rem; }.material-links a { border:1px dashed var(--pretzel); border-radius:25px; padding:.7rem 1rem; font-size:.7rem; text-transform:capitalize; }
      `}</style>
    </article>
  );
}

function safeShopifyImageUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "cdn.shopify.com" || url.hostname.endsWith(".myshopify.com"))
      ? url.toString()
      : null;
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
}
