import type { CodegenConfig } from "@graphql-codegen/cli";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const config: CodegenConfig = {
  schema: domain
    ? [{
        [`https://${domain}/api/${process.env.SHOPIFY_API_VERSION ?? "2026-10"}/graphql.json`]: {
          headers: { "X-Shopify-Storefront-Access-Token": token ?? "" },
        },
      }]
    : [],
  documents: ["src/lib/shopify/**/*.graphql"],
  generates: {
    "src/lib/shopify/generated.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: { enumsAsTypes: true, avoidOptionals: true, immutableTypes: true },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
