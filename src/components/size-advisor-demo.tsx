"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { WOMEN_DIRNDL_DEFAULT } from "@/lib/default-size-charts";
import { FitFeedbackSurvey } from "./size-advisor/fit-feedback-survey";

const SizeAdvisorDrawer = dynamic(
  () => import("./size-advisor/size-advisor-drawer").then((module) => module.SizeAdvisorDrawer),
  { loading: () => null },
);

export function SizeAdvisorDemo() {
  const [open, setOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  return (
    <main className="atelier-product-page size-advisor-demo">
      <div className="size-advisor-demo-grid">
        <div className="size-advisor-demo-copy">
          <span className="eyebrow">ALPINE ATELIER · INTERACTIVE PREVIEW</span>
          <h1>Find your <em>dirndl fit.</em></h1>
          <p>Try the quick estimate or guided measurement flow. The chart below is illustrative and must be replaced with brand-verified data.</p>
          <button type="button" className="find-my-size-button" onClick={() => setOpen(true)}>Find my size</button>
          {selectedSize && <p role="status">Selected Shopify option: {selectedSize}</p>}
          {selectedSize && <FitFeedbackSurvey product="Demo dirndl" size={selectedSize} />}
        </div>
        <div className="size-advisor-demo-reference">
          <Image
            src="https://oktoberfestoutfits.com/cdn/shop/files/comfort-stylish-dirndl-hero-banner.webp?v=1783725787&width=1100"
            alt="Real dirndl fit and proportion reference"
            fill
            sizes="(max-width: 640px) 100vw, 44vw"
            priority
            unoptimized
          />
        </div>
      </div>
      {open && (
        <SizeAdvisorDrawer
          open={open}
          onClose={() => setOpen(false)}
          productTitle="Alpine embroidered dirndl"
          productType="Dirndl"
          sizeChartValue={JSON.stringify(WOMEN_DIRNDL_DEFAULT)}
          availableSizes={WOMEN_DIRNDL_DEFAULT.sizes.map((row) => row.eu ?? row.size)}
          onSelectSize={setSelectedSize}
        />
      )}
    </main>
  );
}
