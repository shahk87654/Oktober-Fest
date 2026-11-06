"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export function AnalyticsConsent() {
  const [consent, setConsent] = useState<"unknown" | "granted" | "denied">("unknown");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("wiesn-analytics-consent");
      if (saved === "granted" || saved === "denied") setConsent(saved);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function choose(value: "granted" | "denied") {
    localStorage.setItem("wiesn-analytics-consent", value);
    setConsent(value);
  }

  return (
    <>
      {consent === "granted" && process.env.NEXT_PUBLIC_GA_ID && <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-consent-init" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; window.gtag = function(){window.dataLayer.push(arguments)}; window.gtag('js', new Date()); window.gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { anonymize_ip: true });`}</Script>
      </>}
      {consent === "granted" && process.env.NEXT_PUBLIC_META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${process.env.NEXT_PUBLIC_META_PIXEL_ID}');fbq('track','PageView');`}</Script>
      )}
      {consent === "unknown" && <aside className="consent" aria-label="Cookie preferences"><p>We use optional analytics to understand what makes a good visit. Your choice is yours.</p><div><button type="button" onClick={() => choose("denied")}>Essential only</button><button type="button" onClick={() => choose("granted")}>Allow analytics</button></div><style>{`
        .consent { position:fixed; z-index:100; right:1rem; bottom:1rem; width:min(440px,calc(100% - 2rem)); border:1px solid var(--line); border-radius:12px; padding:1rem; background:var(--cream); box-shadow:0 10px 35px rgba(20,33,26,.18); }
        p { margin:0 0 .8rem; font-size:.75rem; line-height:1.5; }div { display:flex; gap:.5rem; }button { min-height:40px; flex:1; border:1px solid var(--hops); border-radius:24px; background:transparent; font-size:.65rem; font-weight:700; cursor:pointer; }button:last-child { background:var(--hops); color:white; }
      `}</style></aside>}
    </>
  );
}
