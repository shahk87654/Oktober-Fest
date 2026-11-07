"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

export function NewsletterForm({ compact = false, shopDomain = "" }: { compact?: boolean; shopDomain?: string }) {
  const [email, setEmail] = useState("");
  const validDomain = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(shopDomain) ? shopDomain : "";

  return (
    <form className={`newsletter-form ${compact ? "newsletter-compact" : ""}`} action={validDomain ? `https://${validDomain}/contact#contact_form` : undefined} method="post">
      <input type="hidden" name="form_type" value="customer" />
      <input type="hidden" name="utf8" value="✓" />
      <input type="hidden" name="contact[tags]" value="newsletter" />
      <div className="newsletter-input-wrap">
        <input type="email" name="contact[email]" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" aria-label="Your email address" disabled={!validDomain} />
        <button type="submit" disabled={!validDomain} aria-label="Subscribe"><span>{compact ? "JOIN" : "SIGN ME UP"}</span>{!compact && <ArrowRight size={17} />}{compact && <Check size={14} />}</button>
      </div>
      {!validDomain && <p className="form-error" role="status">Newsletter signup is available when the Shopify store domain is configured.</p>}
      {!compact && <span className="newsletter-privacy">By subscribing, you agree to our Privacy Policy.</span>}
    </form>
  );
}
