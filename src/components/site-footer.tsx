import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { getStorePolicy } from "@/lib/policy";
import { cookies } from "next/headers";
import { CountryCurrencySelector } from "@/components/country-currency-selector";
import Image from "next/image";

const footerLinks = [
  { heading: "Visit & connect", links: [["Contact us", "/pages/contact"], ["Our story", "/pages/about"], ["Shipping & returns", "/policies/shipping-policy"], ["Size guide", "/pages/size-guide"]] },
  { heading: "The fine print", links: [["Privacy policy", "/policies/privacy-policy"], ["Terms of service", "/policies/terms-of-service"], ["Refund policy", "/policies/refund-policy"], ["Accessibility", "/pages/accessibility"]] },
  { heading: "Your corner", links: [["My account", "/account"], ["Track an order", "/account"], ["Find your fit", "/pages/size-guide"], ["FAQs", "/pages/faqs"]] },
];

export async function SiteFooter({ shopName = "Wiesn Atelier", shopLogo }: { shopName?: string; shopLogo?: string }) {
  const policy = await getStorePolicy();
  const country = (await cookies()).get("wiesn_country")?.value ?? "US";
  return (
    <footer className="site-footer">
      <div className="footer-pattern" aria-hidden="true" />
      <div className="page-shell footer-main">
        <div className="footer-brand">
          <Link href="/" className="footer-logo" aria-label={`${shopName} home`}>
            {shopLogo ? <Image src={shopLogo} alt="" width={160} height={52} /> : <span>{shopName}</span>}
          </Link>
          <p>Made for the moments<br />you&apos;ll talk about forever.</p>
          <div className="socials" aria-label="Social media">
            <a href="https://www.facebook.com/" aria-label="Facebook" rel="noopener noreferrer" className="social-tiktok">f</a>
            <a href="https://www.instagram.com/" aria-label="Instagram" rel="noopener noreferrer" className="social-tiktok">◎</a>
            <a href="https://www.youtube.com/" aria-label="YouTube" rel="noopener noreferrer" className="social-tiktok">▶</a>
            <a href="https://www.tiktok.com/" aria-label="TikTok" rel="noopener noreferrer" className="social-tiktok">♪</a>
            <a href="https://www.pinterest.com/" aria-label="Pinterest" rel="noopener noreferrer" className="social-tiktok">P</a>
          </div>
        </div>
        {footerLinks.map((column) => (
          <div className="footer-column" key={column.heading}>
            <h2>{column.heading}</h2>
            {column.links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}
          </div>
        ))}
        <div className="footer-newsletter">
          <p className="eyebrow">A little note from Bavaria</p>
          <h2 className="display">Get 10% off<br />your first order.</h2>
          <NewsletterForm />
          <small>By subscribing, you agree to our privacy policy. Unsubscribe anytime.</small>
        </div>
      </div>
      <div className="page-shell footer-bottom">
        <div className="footer-contact"><a href="mailto:servus@wiesnatelier.com">servus@wiesnatelier.com</a><a href="tel:+18005550184">US +1 800 555 0184</a><a href="tel:+442080123456">UK +44 20 8012 3456</a></div>
        <p>© {new Date().getFullYear()} {shopName} · {policy.returnWindowDays} day return policy</p>
        <CountryCurrencySelector initialCountry={country} />
      </div>
      <div className="page-shell payment-row"><span>VISA</span><span>mastercard</span><span>AMEX</span><span>Shop Pay</span><span>Apple Pay</span><span>Google Pay</span><b>Secure checkout · 14 day returns</b></div>
      <style>{`
        .site-footer { position:relative; overflow:hidden; background:var(--forest); color:var(--cream); }
        .footer-pattern { height:36px; background-color:var(--cream); background-image:url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18 0 36 18 18 36 0 18z' fill='%230098d4'/%3E%3Cpath d='M18 0 36 18H18zM18 36 0 18h18z' fill='%23fff'/%3E%3C/svg%3E"); background-size:36px 36px; }
        .footer-main { display:grid; grid-template-columns:1.25fr .8fr .9fr .8fr 1.5fr; gap:2.5rem; padding-block:4.2rem 3.5rem; }
        .footer-logo { display:inline-block; font-size:1.05rem; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
        .footer-logo img { width:auto; max-width:160px; height:auto; max-height:52px; object-fit:contain; }
        .footer-logo span { display:block; max-width:190px; }
        .footer-brand p { margin:1.2rem 0; color:rgba(246,240,228,.67); font-family:var(--font-display); font-size:1.45rem; line-height:1.18; }
        .socials { display:flex; gap:.65rem; }
        .socials a { display:grid; width:34px; height:34px; place-items:center; border:1px solid rgba(246,240,228,.3); border-radius:50%; transition:.2s; }
        .socials a:hover { background:var(--gold); border-color:var(--gold); color:var(--forest); }
        .social-tiktok { font-weight:700; }
        .footer-column { display:flex; flex-direction:column; gap:.8rem; }
        .footer-column h2 { margin:0 0 .45rem; color:var(--gold); font-size:.66rem; letter-spacing:.14em; text-transform:uppercase; }
        .footer-column a { color:rgba(246,240,228,.75); font-size:.78rem; }
        .footer-column a:hover { color:white; text-decoration:underline; text-decoration-color:var(--gold); text-underline-offset:4px; }
        .footer-newsletter .eyebrow { color:var(--gold); }
        .footer-newsletter h2 { margin:.6rem 0 1.2rem; font-size:2.05rem; line-height:1.02; }
        .footer-newsletter small { display:block; margin-top:.7rem; color:rgba(246,240,228,.55); font-size:.62rem; line-height:1.5; }
        .footer-bottom { display:flex; align-items:center; justify-content:space-between; gap:1rem; border-top:1px solid rgba(246,240,228,.17); padding-block:1.35rem; }
        .footer-contact { display:flex; flex-wrap:wrap; gap:1rem; font-size:.67rem; }
        .footer-bottom p { color:rgba(246,240,228,.58); font-size:.65rem; }
        .payment-row { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:1.3rem; padding-block:1rem 1.5rem; color:rgba(246,240,228,.72); font-size:.65rem; }
        .payment-row b { margin-left:auto; font-weight:500; }
        @media(max-width:1000px) { .footer-main { grid-template-columns:repeat(3,1fr); } .footer-newsletter { grid-column:span 2; } .footer-bottom { flex-wrap:wrap; } }
        @media(max-width:650px) { .footer-main { grid-template-columns:1fr 1fr; gap:2rem 1rem; padding-block:3rem; } .footer-brand,.footer-newsletter { grid-column:span 2; } .footer-column { gap:.7rem; } .footer-bottom { align-items:flex-start; flex-direction:column; } .footer-contact { flex-direction:column; gap:.5rem; } .payment-row { justify-content:flex-start; gap:.8rem; } .payment-row b { width:100%; margin:0; } }
      `}</style>
    </footer>
  );
}
