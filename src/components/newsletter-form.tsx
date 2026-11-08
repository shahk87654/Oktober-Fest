"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

export function NewsletterForm({
  compact = false,
  shopDomain = "",
}: {
  compact?: boolean;
  shopDomain?: string;
}) {
  const [email, setEmail] = useState("");
  const validDomain = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(shopDomain) ? shopDomain : "";

  return (
    <form
      className={`newsletter-form ${compact ? "newsletter-compact" : ""}`}
      action={validDomain ? `https://${validDomain}/contact#contact_form` : undefined}
      method="post"
    >
      <input type="hidden" name="form_type" value="customer" />
      <input type="hidden" name="utf8" value="✓" />
      <input type="hidden" name="contact[tags]" value="newsletter" />
      <div className="newsletter-input-wrap">
        <input
          type="email"
          name="contact[email]"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email address…"
          aria-label="Your email address"
          disabled={!validDomain}
        />
        <button
          type="submit"
          disabled={!validDomain}
          aria-label="Subscribe to newsletter"
        >
          <span>{compact ? "JOIN" : "SUBSCRIBE"}</span>
          {compact ? <Check size={14} /> : <ArrowRight size={15} />}
        </button>
      </div>
      {!validDomain && (
        <p className="form-error text-xs mt-2" role="status">
          Newsletter activation is enabled when your Shopify domain is configured.
        </p>
      )}
      {!compact && (
        <span className="newsletter-privacy">
          By subscribing, you agree to our Privacy Policy and occasional private atelier dispatches.
        </span>
      )}
    </form>
  );
}
