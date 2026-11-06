"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { NewsletterForm } from "@/components/newsletter-form";

function parts(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return [
    ["Days", Math.floor(seconds / 86_400)],
    ["Hours", Math.floor((seconds % 86_400) / 3_600)],
    ["Minutes", Math.floor((seconds % 3_600) / 60)],
    ["Seconds", seconds % 60],
  ] as const;
}

export function FestivalCountdown({
  targetIso,
  endIso,
  title,
  endedTitle,
}: {
  targetIso: string;
  endIso: string;
  title?: string;
  endedTitle?: string;
}) {
  const [now, setNow] = useState(0);
  const target = new Date(targetIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(target) || !Number.isFinite(end) || end <= target) {
    throw new Error("The Oktoberfest countdown metaobject must include a valid target_date and later end_date.");
  }
  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  const live = now >= target && now <= end;
  const isEnded = now > end;
  const nextYear = new Date(targetIso).getFullYear() + 1;
  const remaining = parts(target - now);
  const description = live
    ? "Good people, long tables, and one more song."
    : isEnded
      ? "Join the list and we’ll let you know when the next season arrives."
      : "A little something to look forward to.";

  return (
    <section className="countdown-wrap">
      <div className="page-shell countdown-card stitch">
        <div className="countdown-copy">
          <p className="eyebrow">{live ? "Raise a glass" : isEnded ? "Until next time" : "Mark your calendar"}</p>
          <h2 className="display">{live ? `${title ?? "The Wiesn"} is on.` : isEnded ? endedTitle ?? `See you at the Wiesn ${nextYear}.` : title ?? "The next Wiesn is calling."}</h2>
          <p>{description}</p>
        </div>
        {live ? <div className="live-ribbon">The festival is live <span aria-hidden="true">✳</span></div> : isEnded ? (
          <div className="waitlist"><NewsletterForm /></div>
        ) : (
          <div className="clock" role="timer" aria-label={`${remaining.map(([name, value]) => `${value} ${name.toLowerCase()}`).join(", ")} until Oktoberfest`}>
            {remaining.map(([label, value]) => <div className="clock-unit" key={label}><strong key={value}>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}
          </div>
        )}
        {!isEnded && <Link href="/collections/oktoberfest" className="button-primary">{live ? "Find your Wiesn look" : "Get ready for the Wiesn"} <ArrowRight size={16} /></Link>}
      </div>
      <style>{`
        .countdown-wrap { padding:2rem 0 5rem; }.countdown-card { position:relative; display:grid; min-height:240px; grid-template-columns:1.2fr 1fr auto; align-items:center; gap:1.5rem; border-radius:14px; padding:clamp(1.5rem,5vw,4rem); background:#e9e4d7; }
        .countdown-copy h2 { max-width:650px; margin:.6rem 0; font-size:clamp(2rem,4vw,3.8rem); line-height:1; }.countdown-copy>p:last-child { color:var(--muted); font-size:.75rem; }.countdown-copy .eyebrow { color:var(--pretzel); }
        .clock { display:flex; justify-content:center; gap:.5rem; }.clock-unit { display:grid; min-width:56px; justify-items:center; gap:.35rem; }.clock-unit strong { display:grid; min-width:52px; height:58px; place-items:center; border-radius:7px; background:var(--forest); color:var(--cream); font-family:var(--font-display); font-size:1.8rem; animation:flip .3s ease-out; }.clock-unit span { font-size:.54rem; letter-spacing:.12em; text-transform:uppercase; }
        .live-ribbon { color:var(--hops); font-family:var(--font-display); font-size:1.5rem; text-align:center; }.live-ribbon span { color:var(--gold); }
        .waitlist { width:min(340px,100%); }.waitlist .newsletter-form { border-color:var(--forest); }.waitlist input { color:var(--forest); }.waitlist input::placeholder { color:var(--muted); }
        @keyframes flip { from { transform:rotateX(-45deg); opacity:.5; } to { transform:none; opacity:1; } }
        @media(max-width:850px) { .countdown-card { grid-template-columns:1fr 1fr; }.countdown-copy { grid-column:span 2; }.clock { justify-content:flex-start; } }
        @media(max-width:600px) { .countdown-card { grid-template-columns:1fr; }.countdown-copy { grid-column:auto; }.clock { gap:.3rem; }.clock-unit { min-width:45px; }.clock-unit strong { min-width:42px; height:50px; font-size:1.4rem; } }
        @media(prefers-reduced-motion:reduce) { .clock-unit strong { animation:none; } }
      `}</style>
    </section>
  );
}
