import type { Metadata } from "next";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getCollections } from "@/lib/shopify/collections";
import { CollectionsCatalog } from "@/components/collections-catalog";

export const metadata: Metadata = {
  title: "Bavarian Collections Archive | Alpine Atelier",
  description:
    "Explore the complete collection of authentic Bavarian Trachten, wild-buckskin lederhosen, silk-jacquard dirndls, and heirloom accessories for Oktoberfest 2026.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "Bavarian Collections Archive | Alpine Atelier",
    description:
      "Explore handcrafted Alpine Trachten, bespoke lederhosen, and couture dirndls curated for Munich Oktoberfest 2026.",
  },
};

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  if (!isShopifyConfigured()) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-[#FAFAF8]">
        <span className="px-3 py-1 rounded-full bg-emerald-950/5 border border-emerald-900/10 text-emerald-950 text-xs font-semibold tracking-widest uppercase mb-4">
          Live From The Atelier
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-slate-900 mb-3">
          Collections <span className="italic">await.</span>
        </h1>
        <p className="text-slate-500 max-w-md text-sm sm:text-base mb-6">
          Connect your Shopify store credentials to browse live collections managed in your catalog.
        </p>
      </main>
    );
  }

  const collections = await getCollections();

  return (
    <main>
      <CollectionsCatalog collections={collections} />
    </main>
  );
}
