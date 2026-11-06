import { expect, test } from "@playwright/test";

const handle = process.env.E2E_PRODUCT_HANDLE;

test.describe("PDP outfit purchase", () => {
  test.skip(!handle, "Set E2E_PRODUCT_HANDLE and point the storefront at a Shopify test store.");

  test("selects a variant, adds the outfit and gifts, and updates the cart total", async ({ page }) => {
    await page.goto(`/products/${handle}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const leather = process.env.E2E_LEATHER ?? "Cow";
    const size = process.env.E2E_SIZE ?? "34";
    const leatherChoice = page.getByRole("radio", { name: leather, exact: true });
    if (await leatherChoice.count()) await leatherChoice.click();
    const sizeChoice = page.getByRole("radio", { name: size, exact: true });
    if (await sizeChoice.count()) await sizeChoice.click();
    await page.getByRole("button", { name: /add to bag|claim your free gift/i }).first().click();
    const drawer = page.getByRole("dialog", { name: "Your shopping bag" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/subtotal/i)).toBeVisible();
    const expectedGift = process.env.E2E_GIFT_TITLE;
    if (expectedGift) await expect(drawer.getByText(expectedGift)).toBeVisible();
    await expect(drawer.getByRole("link", { name: /continue to checkout/i })).toHaveAttribute("href", /checkout/);
  });
});
