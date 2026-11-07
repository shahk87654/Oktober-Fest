"use client";

import { useState } from "react";

export function ContactForm({ shopDomain }: { shopDomain: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const validDomain = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(shopDomain) ? shopDomain : "";
  return <form className="contact-form" action={validDomain ? `https://${validDomain}/contact#contact_form` : undefined} method="post">
    <input type="hidden" name="form_type" value="contact" />
    <input type="hidden" name="utf8" value="✓" />
    <label>Your name<input name="contact[name]" value={name} onChange={(event) => setName(event.target.value)} required disabled={!validDomain} /></label>
    <label>Email address<input name="contact[email]" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={!validDomain} /></label>
    <label>Your note<textarea name="contact[body]" value={message} onChange={(event) => setMessage(event.target.value)} rows={5} required disabled={!validDomain} /></label>
    {!validDomain && <p className="form-error">Contact is available when the Shopify store domain is configured.</p>}
    <button className="button button-dark" type="submit" disabled={!validDomain}>SEND YOUR NOTE</button>
  </form>;
}
