"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function ContactForm({ shopDomain }: { shopDomain: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const validDomain = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(shopDomain) ? shopDomain : "";
  return (
    <form className="contact-form" action={validDomain ? `https://${validDomain}/contact#contact_form` : undefined} method="post">
      <input type="hidden" name="form_type" value="contact" />
      <input type="hidden" name="utf8" value="✓" />
      <label>
        <span><i>01</i> YOUR NAME</span>
        <input name="contact[name]" placeholder="How should we address you?" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required disabled={!validDomain} />
      </label>
      <label>
        <span><i>02</i> EMAIL ADDRESS</span>
        <input name="contact[email]" type="email" placeholder="Where can we reach you?" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={!validDomain} />
      </label>
      <label>
        <span><i>03</i> YOUR NOTE</span>
        <textarea name="contact[body]" placeholder="Tell us a little about what you need…" value={message} onChange={(event) => setMessage(event.target.value)} rows={5} required disabled={!validDomain} />
      </label>
      {!validDomain && <p className="form-error">Contact is available when the Shopify store domain is configured.</p>}
      <button className="button button-dark" type="submit" disabled={!validDomain}>SEND YOUR NOTE <ArrowRight size={15} /></button>
      <p className="contact-form-privacy">Your details are used only to respond to your message.</p>
    </form>
  );
}
