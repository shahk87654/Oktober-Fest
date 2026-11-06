import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("customer_oauth_state")?.value;
  const verifier = cookieStore.get("customer_oauth_verifier")?.value;
  const invalid = !code || !state || !expectedState || !verifier || !safeEqual(state, expectedState);
  const redirect = new URL(invalid ? "/account?error=login" : "/account", env.NEXT_PUBLIC_SITE_URL);
  const response = NextResponse.redirect(redirect);
  response.cookies.delete("customer_oauth_state");
  response.cookies.delete("customer_oauth_verifier");
  response.headers.set("Cache-Control", "no-store");
  if (invalid) return response;

  if (!env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || !env.SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL || !env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI) {
    return NextResponse.json({ error: "Customer Account API OAuth is not configured." }, { status: 503 });
  }
  const tokenResponse = await fetch(env.SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
      redirect_uri: env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI,
      code: code!,
      code_verifier: verifier!,
    }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) {
    return NextResponse.json({ error: `Customer Account API token exchange failed (${tokenResponse.status}).` }, { status: 502 });
  }
  const token = await tokenResponse.json() as { access_token?: string; expires_in?: number; token_type?: string };
  if (!token.access_token) return NextResponse.json({ error: "Customer Account API did not return an access token." }, { status: 502 });
  response.cookies.set("customer_access_token", token.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(60, token.expires_in ?? 3600),
  });
  return response;
}
