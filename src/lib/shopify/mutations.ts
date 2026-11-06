export const CART_FRAGMENT = `fragment CartFields on Cart {
  id checkoutUrl totalQuantity
  buyerIdentity { countryCode }
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  lines(first: 100) {
    nodes {
      id quantity
      merchandise {
        ... on ProductVariant {
          id title selectedOptions { name value }
          product { title handle featuredImage { url altText width height } }
          price { amount currencyCode }
        }
      }
      cost { totalAmount { amount currencyCode } }
      attributes { key value }
    }
  }
}`;

const CART_USER_ERRORS = `userErrors { field message code }`;

export const CART_QUERY = `query Cart($id: ID!) {
  cart(id: $id) { ...CartFields }
}
${CART_FRAGMENT}`;

export const CART_CREATE_MUTATION = `mutation CartCreate($input: CartInput!) {
  cartCreate(input: $input) { cart { ...CartFields } ${CART_USER_ERRORS} }
}
${CART_FRAGMENT}`;

export const CART_LINES_ADD_MUTATION = `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } ${CART_USER_ERRORS} }
}
${CART_FRAGMENT}`;

export const CART_LINES_UPDATE_MUTATION = `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } ${CART_USER_ERRORS} }
}
${CART_FRAGMENT}`;

export const CART_LINES_REMOVE_MUTATION = `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } ${CART_USER_ERRORS} }
}
${CART_FRAGMENT}`;

export const CART_BUYER_IDENTITY_UPDATE_MUTATION = `mutation CartBuyerIdentityUpdate(
  $cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!
) {
  cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
    cart { ...CartFields } ${CART_USER_ERRORS}
  }
}
${CART_FRAGMENT}`;
