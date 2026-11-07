import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";
import { collectionHandles, journalBlogHandle } from "@/lib/config";

const footerColumns = [
  { title: "SHOP", links: [["Men", `/collections/${collectionHandles.men}`], ["Women", `/collections/${collectionHandles.women}`], ["Children", `/collections/${collectionHandles.kids}`], ["Accessories", `/collections/${collectionHandles.accessories}`], ["All collections", "/collections"]] },
  { title: "THE ATELIER", links: [["Our story", "/about"], ["Journal", `/blogs/${journalBlogHandle}`], ["Contact", "/pages/contact"], ["Size guide", "/pages/size-guide"]] },
  { title: "SERVICE", links: [["Shipping", "/policies/shipping-policy"], ["Returns", "/policies/refund-policy"], ["Privacy", "/policies/privacy-policy"], ["Terms", "/policies/terms-of-service"]] },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="wordmark footer-wordmark" href="/"><span className="wordmark-top">ALPINE</span><span className="wordmark-bottom">ATELIER</span></Link>
          <p>Heritage, considered.<br />Made for the moments that matter.</p>
          <div className="social-links"><a href="https://instagram.com" target="_blank" rel="noreferrer">INSTAGRAM <ArrowUpRight size={12} /></a><a href="https://pinterest.com" target="_blank" rel="noreferrer">PINTEREST <ArrowUpRight size={12} /></a></div>
        </div>
        {footerColumns.map((column) => <div className="footer-column" key={column.title}><span className="eyebrow">{column.title}</span>{column.links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div>)}
        <div className="footer-newsletter"><span className="eyebrow">A LITTLE MORE ALPINE</span><p>Seasonal notes, new arrivals, and stories from the mountains.</p><NewsletterForm compact shopDomain={process.env.SHOPIFY_STORE_DOMAIN} /></div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ALPINE ATELIER</span><span>AN EXPRESSION OF BAVARIAN HERITAGE</span><div><Link href="/policies/privacy-policy">PRIVACY</Link><Link href="/policies/terms-of-service">TERMS</Link></div>
      </div>
    </footer>
  );
}
