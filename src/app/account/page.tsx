import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const accountUrl = domain ? `https://${domain}/account/login` : null;
  return <main className="store-setup account-page">
    <span className="eyebrow">A PLACE FOR YOUR PIECES</span>
    <h1>Your atelier,<br /><em>your account.</em></h1>
    <p>Sign in securely through the Shopify account experience to view your orders and details.</p>
    {accountUrl ? <a className="button button-dark" href={accountUrl}>CONTINUE TO SHOPIFY <ArrowUpRight size={15} /></a> : <p className="account-note">Customer accounts are available once the Shopify storefront is connected.</p>}
    <Link className="text-link" href="/collections">RETURN TO THE COLLECTIONS</Link>
  </main>;
}
