import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const required = [
    env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
    env.SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL,
    env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI,
  ];
  if (required.some((value) => !value)) {
    return NextResponse.json({ error: "Customer Account API OAuth is not configured." }, { status: 503 });
  }
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const url = new URL(env.SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL!);
  url.searchParams.set("client_id", env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!);
  url.searchParams.set("redirect_uri", env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  const response = NextResponse.redirect(url);
  const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 600 };
  response.cookies.set("customer_oauth_state", state, cookieOptions);
  response.cookies.set("customer_oauth_verifier", verifier, cookieOptions);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
