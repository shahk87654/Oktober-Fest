"use client";

import { useState, useTransition } from "react";
import { changeCountryAction } from "@/actions/locale";

const countries = [
  ["US", "United States · USD"],
  ["DE", "Deutschland · EUR"],
  ["GB", "United Kingdom · GBP"],
  ["CA", "Canada · CAD"],
  ["AU", "Australia · AUD"],
  ["NZ", "New Zealand · NZD"],
  ["CH", "Switzerland · CHF"],
];

export function CountryCurrencySelector({ initialCountry = "US" }: { initialCountry?: string }) {
  const [country, setCountry] = useState(initialCountry);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <label className="country-select">Ship to
      <select aria-label="Choose shipping country and currency" value={country} disabled={pending} onChange={(event) => {
        const nextCountry = event.target.value;
        setError("");
        startTransition(async () => {
          try {
            const saved = await changeCountryAction(nextCountry);
            setCountry(saved);
            window.location.reload();
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "The country could not be changed.");
          }
        });
      }}>
        {countries.map(([code, label]) => <option value={code} key={code}>{label}</option>)}
      </select>
      {error && <span role="alert">{error}</span>}
      <style>{`
        .country-select { display:flex; align-items:center; gap:.55rem; font-size:.65rem; }
        select { max-width:190px; border:0; background:transparent; color:inherit; font-size:.65rem; }
        option { color:var(--forest); }.country-select span { color:#ffb7a9; }
      `}</style>
    </label>
  );
}
