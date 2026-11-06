"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { subscribeNewsletter, type NewsletterState } from "@/actions/newsletter";

const initialState: NewsletterState = { status: "idle", message: "" };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, initialState);
  return (
    <form action={action} className="newsletter-form">
      <label className="sr-only" htmlFor="newsletter-email">Email address</label>
      <input id="newsletter-email" name="email" type="email" autoComplete="email" required placeholder="Your email address" />
      <button type="submit" aria-label="Subscribe" disabled={pending}><ArrowRight size={18} aria-hidden="true" /></button>
      <p className={`newsletter-message newsletter-message--${state.status}`} aria-live="polite">
        {pending ? "One moment…" : state.message}
      </p>
      <style>{`
        .newsletter-form { position:relative; display:flex; height:48px; border-bottom:1px solid rgba(246,240,228,.6); }
        input { flex:1; min-width:0; border:0; outline:0; background:transparent; color:var(--cream); font-size:.78rem; }
        input::placeholder { color:rgba(246,240,228,.6); }
        button { display:grid; width:42px; place-items:center; border:0; background:transparent; color:var(--gold); cursor:pointer; }
        button:disabled { opacity:.5; }
        .newsletter-message { position:absolute; top:100%; margin:.5rem 0 0; color:var(--gold); font-size:.68rem; }
        .newsletter-message--error { color:#ffb7a9; }
      `}</style>
    </form>
  );
}
