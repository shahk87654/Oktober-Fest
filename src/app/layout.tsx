import type { Metadata } from "next";
import { Fraunces, Inter, UnifrakturCook } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart-drawer";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { fetchCart } from "@/lib/shopify/cart";
import { shopifyConfigured } from "@/lib/env";
import { getMetaobject, getShopBrand } from "@/lib/shopify/storefront";
import { getStorePolicy } from "@/lib/policy";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraktur = UnifrakturCook({
  variable: "--font-fraktur",
  weight: "700",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const shop = shopifyConfigured ? await getShopBrand() : null;
  const brandName = shop?.name ?? "Wiesn Atelier";
  const title = `${brandName} — Bavarian Craft, Made for the Moment`;
  const description = "Discover considered lederhosen, dirndl and Bavarian essentials, crafted with care for every celebration.";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: title, template: `%s | ${brandName}` },
    description,
    openGraph: { type: "website", siteName: brandName, title, description },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [cart, announcement, policy, shop] = await Promise.all([
    shopifyConfigured ? fetchCart() : null,
    shopifyConfigured ? getMetaobject<{ id: string; first_message?: string; second_message?: string }>("announcement", "global") : null,
    getStorePolicy(),
    shopifyConfigured ? getShopBrand() : null,
  ]);
  const announcementCopy = {
    firstMessage: announcement?.first_message ?? "Loved by 25,000+ Wiesn-goers",
    secondMessage: announcement?.second_message ?? `Free US shipping over $${policy.shippingThresholdUSD}`,
  };
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${fraktur.variable}`}>
      <body className="min-h-screen flex flex-col">
        <SiteHeader initialCount={cart?.totalQuantity ?? 0} announcement={announcementCopy} shopName={shop?.name} shopLogo={shop?.logo?.url} />
        <main className="flex-1">{children}</main>
        <SiteFooter shopName={shop?.name} shopLogo={shop?.logo?.url} />
        <CartDrawer thresholds={policy.shippingThresholds} />
        <AnalyticsConsent />
      </body>
    </html>
  );
}
