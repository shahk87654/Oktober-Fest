"use client";

import { useState } from "react";
import { ArrowRight, Send } from "lucide-react";

export function ContactForm({ shopDomain }: { shopDomain: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const validDomain = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(shopDomain) ? shopDomain : "";

  return (
    <form
      className="contact-form"
      action={validDomain ? `https://${validDomain}/contact#contact_form` : undefined}
      method="post"
    >
      <input type="hidden" name="form_type" value="contact" />
      <input type="hidden" name="utf8" value="✓" />
      <label>
        <span className="text-xs font-bold text-slate-800 tracking-wider">
          YOUR FULL NAME
        </span>
        <input
          name="contact[name]"
          placeholder="e.g. Maximilian Weber"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          disabled={!validDomain}
        />
      </label>
      <label>
        <span className="text-xs font-bold text-slate-800 tracking-wider">
          EMAIL ADDRESS
        </span>
        <input
          name="contact[email]"
          type="email"
          placeholder="e.g. maximilian@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={!validDomain}
        />
      </label>
      <label>
        <span className="text-xs font-bold text-slate-800 tracking-wider">
          MESSAGE &amp; INQUIRY
        </span>
        <textarea
          name="contact[body]"
          placeholder="Questions about sizing, custom orders, or delivery timing…"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          required
          disabled={!validDomain}
        />
      </label>
      {!validDomain && (
        <p className="form-error text-xs">
          Direct atelier messaging is enabled when the Shopify store domain is connected.
        </p>
      )}
      <button
        className="button button-dark self-start mt-2"
        type="submit"
        disabled={!validDomain}
      >
        <span>SEND ATELIER MESSAGE</span>
        <Send size={14} />
      </button>
      <p className="contact-form-privacy text-xs text-slate-500 m-0">
        Your information is handled strictly in accordance with our Privacy Policy.
      </p>
    </form>
  );
}
