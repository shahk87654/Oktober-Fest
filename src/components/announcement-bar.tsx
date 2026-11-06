"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function AnnouncementBar({ firstMessage = "Loved by 25,000+ Wiesn-goers", secondMessage = "Free US shipping over $299" }: { firstMessage?: string; secondMessage?: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(sessionStorage.getItem("wiesn-announcement-dismissed") !== "true");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div className="announcement" aria-label="Store announcement">
      <div className="announcement__track" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index}>{firstMessage} <b>✳</b> {secondMessage} <b>✳</b> Made with Bavarian heart <b>✳</b></span>
        ))}
      </div>
      <span className="sr-only">Loved by 25,000+ Wiesn-goers. Free US shipping over $299.</span>
      <button
        className="announcement__close"
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => {
          sessionStorage.setItem("wiesn-announcement-dismissed", "true");
          setVisible(false);
        }}
      >
        <X size={14} aria-hidden="true" />
      </button>
      <style>{`
        .announcement { position: relative; display: flex; height: 34px; overflow: hidden; align-items: center; justify-content: center; background: var(--hops); color: white; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; }
        .announcement__track { display: flex; width: max-content; animation: marquee 38s linear infinite; }
        .announcement__track:hover { animation-play-state: paused; }
        .announcement__track span { padding-right: 3rem; white-space: nowrap; }
        .announcement b { color: var(--gold); padding-inline: .8rem; }
        .announcement__close { position: absolute; right: 12px; top: 50%; display: grid; width: 28px; height: 28px; place-items: center; transform: translateY(-50%); background: var(--hops); border: 0; cursor: pointer; }
        @keyframes marquee { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .announcement__track { animation: none; } }
      `}</style>
    </div>
  );
}
