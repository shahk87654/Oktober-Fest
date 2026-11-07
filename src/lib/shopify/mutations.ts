export const CART_CREATE_SIMPLE = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
        lines(first: 50) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id title availableForSale sku
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                selectedOptions { name value }
                image { url altText width height }
                product { handle title vendor featuredImage { url altText width height } }
              }
            }
            cost { amountPerQuantity { amount currencyCode } totalAmount { amount currencyCode } }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;
