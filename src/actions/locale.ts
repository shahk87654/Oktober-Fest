"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { setCartCountry } from "@/lib/shopify/cart";

const countrySchema = z.enum(["US", "DE", "GB", "CA", "AU", "NZ", "CH"]);

export async function changeCountryAction(countryCode: string) {
  const country = countrySchema.parse(countryCode);
  const cookieStore = await cookies();
  cookieStore.set("wiesn_country", country, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  await setCartCountry(country);
  return country;
}
