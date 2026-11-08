import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";
import { collectionHandles, journalBlogHandle } from "@/lib/config";

const footerColumns = [
  {
    title: "ATELIER COLLECTIONS",
    links: [
      ["Men's Lederhosen & Shirts", `/collections/${collectionHandles.men}`],
      ["Women's Couture Dirndls", `/collections/${collectionHandles.women}`],
      ["Children & Family Edits", `/collections/${collectionHandles.kids}`],
      ["Trachten Accessories", `/collections/${collectionHandles.accessories}`],
      ["All Collections Index", "/collections"],
    ],
  },
  {
    title: "THE HERITAGE",
    links: [
      ["Our Bavarian Story", "/about"],
      ["Atelier Journal", `/blogs/${journalBlogHandle}`],
      ["Measurement & Size Guide", "/pages/size-guide"],
      ["Concierge & Contact", "/pages/contact"],
    ],
  },
  {
    title: "CLIENT SERVICE",
    links: [
      ["Express Worldwide Shipping", "/policies/shipping-policy"],
      ["30-Day Hassle-Free Returns", "/policies/refund-policy"],
      ["Privacy & Data Security", "/policies/privacy-policy"],
      ["Terms of Service", "/policies/terms-of-service"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="wordmark inline-flex flex-col items-start" href="/">
            <span className="wordmark-top text-lg font-extrabold text-emerald-950 tracking-widest">
              ALPINE ATELIER
            </span>
            <span className="wordmark-bottom text-[9px] text-slate-400 font-bold tracking-widest">
              BAVARIA 1898 • MODERN EDIT
            </span>
          </Link>
          <p>
            Bavarian festive heritage, reimagined for the modern world.
            Handcrafted with uncompromising European excellence.
          </p>
          <div className="social-links">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5"
            >
              <span>INSTAGRAM</span>
              <ArrowUpRight size={13} />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5"
            >
              <span>PINTEREST</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div className="footer-column" key={column.title}>
            <span className="eyebrow text-slate-700 font-bold tracking-widest text-[11px]">
              {column.title}
            </span>
            {column.links.map(([label, href]) => (
              <Link href={href} key={label}>
                {label}
              </Link>
            ))}
          </div>
        ))}

        <div className="footer-newsletter">
          <span className="eyebrow text-emerald-800 font-bold tracking-widest text-[11px]">
            <i /> ATELIER PRIVILEGE
          </span>
          <p>
            Receive private previews of upcoming seasonal collections and Oktoberfest invitations.
          </p>
          <NewsletterForm compact shopDomain={process.env.SHOPIFY_STORE_DOMAIN} />
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ALPINE ATELIER. ALL RIGHTS RESERVED.</span>
        <span className="hidden md:inline-flex items-center gap-2 text-slate-400 font-semibold">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span>AUTHENTIC GERMAN CRAFTSMANSHIP GUARANTEE</span>
        </span>
        <div>
          <Link href="/policies/privacy-policy" className="hover:text-emerald-800">
            PRIVACY
          </Link>
          <Link href="/policies/terms-of-service" className="hover:text-emerald-800">
            TERMS
          </Link>
        </div>
      </div>
    </footer>
  );
}
