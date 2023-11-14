import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3420/");
});

test("initial load", async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Mutiny Wallet/);

    await expect(page.locator("header")).toContainText(["Activity"], {
        timeout: 30000
    });

    // Wait up to 30 seconds for an image element matching the selector to be visible
    await page.waitForSelector("img[alt='lightning']", { timeout: 30000 });

    // Wait for an element matching the selector to appear in DOM.
    await page.waitForSelector("text=0 SATS");

    console.log("Page loaded.");
});

