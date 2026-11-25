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
  title: {
    default: "Alpine Atelier — Modern Bavarian Trachten & Couture",
    template: "%s — Alpine Atelier",
  },
  description:
    "Handcrafted Bavarian lederhosen, couture dirndls, and heirloom Alpine festival wear for Oktoberfest 2026 and beyond.",
  openGraph: {
    title: "Alpine Atelier — Modern Bavarian Trachten & Couture",
    description: "Handcrafted Bavarian lederhosen, couture dirndls, and heirloom Alpine festival wear.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://oktoberfestoutfits.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FFFFFF] text-[#24231F] antialiased selection:bg-[#792D38] selection:text-white">
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
