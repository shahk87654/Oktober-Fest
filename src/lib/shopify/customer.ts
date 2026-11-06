import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const CUSTOMER_QUERY = `query CustomerAccount {
  customer {
    id firstName lastName
    emailAddress { emailAddress }
    orders(first: 10, reverse: true) {
      nodes {
        id name processedAt
        totalPrice { amount currencyCode }
        fulfillmentStatus
        lineItems(first: 10) { nodes { title quantity } }
      }
    }
    addresses(first: 10) {
      nodes { id firstName lastName address1 address2 city provinceCode zip countryCodeV2 }
    }
  }
}`;

export type CustomerAccount = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: { emailAddress: string };
  orders: { nodes: { id: string; name: string; processedAt: string; totalPrice: { amount: string; currencyCode: string }; fulfillmentStatus: string; lineItems: { nodes: { title: string; quantity: number }[] } }[] };
  addresses: { nodes: { id: string; firstName: string | null; lastName: string | null; address1: string | null; address2: string | null; city: string | null; provinceCode: string | null; zip: string | null; countryCodeV2: string | null }[] };
};

export async function getCustomerAccount() {
  const token = (await cookies()).get("customer_access_token")?.value;
  if (!token) return null;
  if (!env.SHOPIFY_CUSTOMER_ACCOUNT_GRAPHQL_URL) {
    throw new Error("SHOPIFY_CUSTOMER_ACCOUNT_GRAPHQL_URL is required to load account details.");
  }
  const response = await fetch(env.SHOPIFY_CUSTOMER_ACCOUNT_GRAPHQL_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: CUSTOMER_QUERY }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Customer Account API returned HTTP ${response.status}.`);
  const result = await response.json() as { data?: { customer: CustomerAccount | null }; errors?: { message: string }[] };
  if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join("; "));
  return result.data?.customer ?? null;
}
