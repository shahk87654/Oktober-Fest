import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteUrl } from "@/lib/config";
import { isShopifyConfigured } from "@/lib/shopify/client";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Alpine Atelier — Tradition, Reimagined", template: "%s — Alpine Atelier" },
  description: "A considered collection of Bavarian clothing, timeless craftsmanship and modern Alpine style.",
  openGraph: {
    title: "Alpine Atelier — Tradition, Reimagined",
    description: "A considered collection of Bavarian clothing and modern Alpine style.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteHeader shopifyConfigured={isShopifyConfigured()} />
          {children}
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
