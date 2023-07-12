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

test("first receive", async ({ page }) => {
  // Click the receive button
  await page.click("text=Receive");

  // Expect the url to conain receive
  await expect(page).toHaveURL(/.*receive/);

  // At least one h1 should show "0 sats"
  await expect(page.locator("h1")).toContainText(["0 SATS"]);

  // At least one h2 should show "0 USD"
  await expect(page.locator("h2")).toContainText(["$0 USD"]);

  // Click the 10k button
  await page.click("text=10k");

  // Now the h1 should show "10,000 sats"
  await expect(page.locator("h1")).toContainText(["10,000 SATS"]);

  // Click the "Set Amount" button
  await page.click("text=Set Amount");

  // There should be a button with the text "Continue" and it should not be disabled
  const continueButton = await page.locator("button", { hasText: "Continue" });
  await expect(continueButton).not.toBeDisabled();

  // Wait one second
  // TODO: figure out how to not get an error without waiting
  await page.waitForTimeout(1000);

  continueButton.click();

  await expect(
      page.getByText("Keep Mutiny open to complete the payment.")
  ).toBeVisible();

  // Locate an SVG inside a div with id "qr"
  const qrCode = await page.locator("#qr > svg");

  await expect(qrCode).toBeVisible();

  const value = await qrCode.getAttribute("value");

  // The SVG's value property includes "bitcoin:t"
  expect(value).toContain("bitcoin:t");

  // Now click thie "Edit" button
  await page.click("text=Edit");

  // There should not be an h1 that says "Error"
  await expect(page.locator("h1")).not.toContainText(["Error"]);
});
