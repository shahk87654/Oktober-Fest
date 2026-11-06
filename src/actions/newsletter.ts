"use server";

import { z } from "zod";
import { storefrontFetch } from "@/lib/shopify/client";
import { shopifyConfigured } from "@/lib/env";

const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

const CUSTOMER_CREATE = `mutation CustomerCreate($input: CustomerCreateInput!) {
  customerCreate(input: $input) {
    customer { id email }
    customerUserErrors { field message code }
  }
}`;

export type NewsletterState = { status: "idle" | "success" | "error"; message: string };

export async function subscribeNewsletter(
  _previousState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }
  if (!shopifyConfigured) {
    return { status: "error", message: "Newsletter sign-up is temporarily unavailable. Please try again later." };
  }
  const result = await storefrontFetch<{
    customerCreate: {
      customer: { id: string; email: string } | null;
      customerUserErrors: { message: string }[];
    };
  }, { input: { email: string; acceptsMarketing: boolean } }>(
    CUSTOMER_CREATE,
    { input: { email: parsed.data.email, acceptsMarketing: true } },
  );
  const mutation = result.customerCreate;
  if (mutation.customerUserErrors.length) {
    return { status: "error", message: mutation.customerUserErrors[0]?.message ?? "We could not subscribe this email." };
  }
  if (!mutation.customer) return { status: "error", message: "We could not subscribe this email. Please try again." };
  return { status: "success", message: "You're on the list. Prost!" };
}
