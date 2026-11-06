import type { Metadata } from "next";
import { signOutAction } from "@/actions/account";
import { getCustomerAccount } from "@/lib/shopify/customer";
import { formatMoney } from "@/lib/format";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const account = await getCustomerAccount();
  return (
    <section className="page-shell account-page">
      <p className="eyebrow">A place for your orders</p><h1 className="display">Your account.</h1>
      {error && <p className="account-error" role="alert">We couldn&apos;t complete sign in. Please try again.</p>}
      {!account ? <div className="account-logged-out"><p>Sign in securely with your Shopify customer account to see your orders and addresses.</p><a className="button-primary" href="/account/login">Continue to sign in</a></div> : (
        <div className="account-data">
          <div className="account-welcome"><div><h2 className="display">Grüß Gott, {account.firstName ?? "friend"}.</h2><p>{account.emailAddress.emailAddress}</p></div><form action={signOutAction}><button className="button-secondary" type="submit">Sign out</button></form></div>
          <div className="account-columns">
            <section><h2 className="display">Your orders</h2>{account.orders.nodes.length ? account.orders.nodes.map((order) => <article className="order-card" key={order.id}><div><strong>{order.name}</strong><span>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(order.processedAt))}</span></div><p>{order.lineItems.nodes.map((line) => `${line.title} × ${line.quantity}`).join(", ")}</p><div><span>{order.fulfillmentStatus.replaceAll("_", " ").toLowerCase()}</span><strong>{formatMoney(order.totalPrice)}</strong></div></article>) : <p className="muted">Your first order will appear here.</p>}</section>
            <section><h2 className="display">Your addresses</h2>{account.addresses.nodes.length ? account.addresses.nodes.map((address) => <address className="address-card" key={address.id}>{[address.firstName, address.lastName, address.address1, address.address2, address.city, address.provinceCode, address.zip, address.countryCodeV2].filter(Boolean).join(", ")}</address>) : <p className="muted">There are no saved addresses yet. Manage addresses in your Shopify customer account.</p>}<a className="account-link" href={env.SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL ?? "/account/login"}>Manage customer details ↗</a></section>
          </div>
        </div>
      )}
      <style>{`
        .account-page { min-height:60vh; padding-block:5rem; }.account-page>.eyebrow { color:var(--pretzel); }.account-page>h1 { margin:.5rem 0 2rem; font-size:clamp(3rem,7vw,6rem); }
        .account-logged-out { max-width:540px; border:1px dashed var(--pretzel); border-radius:14px; padding:2rem; }.account-logged-out p { color:var(--muted); line-height:1.6; }
        .account-welcome { display:flex; align-items:center; justify-content:space-between; border-bottom:1px dashed var(--line); padding-bottom:1.5rem; }.account-welcome h2 { margin:0; font-size:2rem; }.account-welcome p { color:var(--muted); font-size:.75rem; }
        .account-columns { display:grid; grid-template-columns:1.2fr .8fr; gap:3rem; padding-top:2rem; }.account-columns h2 { font-size:1.7rem; }
        .order-card,.address-card { display:block; margin:.8rem 0; border:1px solid var(--line); border-radius:10px; padding:1rem; font-style:normal; }.order-card>div { display:flex; justify-content:space-between; gap:1rem; font-size:.75rem; }.order-card>div span,.order-card p,.muted { color:var(--muted); font-size:.68rem; }.order-card p { line-height:1.5; }.address-card { font-size:.75rem; line-height:1.6; }
        .account-link { display:inline-block; margin-top:.5rem; font-size:.7rem; text-decoration:underline; text-decoration-color:var(--gold); }.account-error { color:var(--berry); }
        @media(max-width:700px) { .account-columns { grid-template-columns:1fr; gap:1rem; }.account-welcome { align-items:flex-start; flex-direction:column; gap:1rem; } }
      `}</style>
    </section>
  );
}
