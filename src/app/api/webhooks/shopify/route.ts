import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";

export const runtime = "nodejs";

function isValidSignature(body: Buffer, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(body).digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(signature, "base64");
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(request: Request) {
  if (!env.SHOPIFY_WEBHOOK_SECRET) {
    return Response.json({ error: "Shopify webhook verification is not configured." }, { status: 503 });
  }
  const signature = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic");
  if (!signature || !topic) return Response.json({ error: "Missing Shopify webhook headers." }, { status: 400 });
  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.byteLength > 1_000_000) return Response.json({ error: "Webhook payload exceeds the allowed size." }, { status: 413 });
  if (!isValidSignature(bytes, signature, env.SHOPIFY_WEBHOOK_SECRET)) {
    return Response.json({ error: "Invalid Shopify webhook signature." }, { status: 401 });
  }

  const payload = JSON.parse(bytes.toString("utf8")) as { handle?: string; admin_graphql_api_id?: string; type?: string };
  if (topic.startsWith("products/")) {
    revalidateTag("products", "max");
    revalidateTag("collections", "max");
    if (payload.handle) revalidateTag(`product:${payload.handle}`, "max");
  } else if (topic.startsWith("collections/")) {
    revalidateTag("collections", "max");
    if (payload.handle) revalidateTag(`collection:${payload.handle}`, "max");
  } else if (topic.startsWith("articles/")) {
    revalidateTag("articles", "max");
    if (payload.handle) revalidateTag(`article:${payload.handle}`, "max");
  } else if (topic.startsWith("metaobjects/")) {
    revalidateTag("metaobjects", "max");
    if (payload.handle && payload.type) {
      revalidateTag(`metaobject:${payload.type}:${payload.handle}`, "max");
    }
    revalidateTag("metaobject:store_policy:shipping-and-returns", "max");
  } else {
    return Response.json({ error: `Unsupported Shopify webhook topic: ${topic}` }, { status: 422 });
  }
  return new Response(null, { status: 204 });
}
