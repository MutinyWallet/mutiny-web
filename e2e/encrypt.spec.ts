import { expect, test } from "@playwright/test";

import { loadHome, visitSettings } from "./utils";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3420/");
});

test("test local encrypt", async ({ page }) => {
    await loadHome(page);
    await visitSettings(page);

    // Click the "Backup" link
    await page.click("text=Backup");

    // Click the "Tap to reveal seed words" button
    await page.click("text=Tap to reveal seed words");

    // Click all three checkboxes
    await page.getByLabel("I wrote down the words").click({ force: true });
    await page
        .getByLabel("I understand that my funds are my responsibility")
        .click({ force: true });
    await page
        .getByLabel("I'm not lying just to get this over with")
        .click({ force: true });

    // The "I wrote down the words" button should not be disabled
    const wroteDownButton = await page.locator("button", {
        hasText: "I wrote down the words"
    });
    await expect(wroteDownButton).not.toBeDisabled();

    // Click the "I wrote down the words" button
    await wroteDownButton.click();

    // Make sure the balance box ready light is on
    await page.locator("title=READY");

    // Go back to settings / change password
    await visitSettings(page);
    await page.click("text=Change Password");

    // The header should now say "Encrypt your seed words"
    await expect(page.locator("h1")).toContainText(["Encrypt your seed words"]);

    // Set a password
    // 1. Find the input field with the name "password"
    const passwordInput = await page.locator(`input[name='password']`);

    // 2. Type the password into the input field
    await passwordInput.fill("test");

    // 3. Find the input field with the name "confirmPassword"
    const confirmPasswordInput = await page.locator(
        `input[name='confirmPassword']`
    );

    // 4. Type the password into the input field
    await confirmPasswordInput.fill("test");

    // The "Encrypt" button should not be disabled
    const encryptButton = await page.locator("button", { hasText: "Encrypt" });
    await expect(encryptButton).not.toBeDisabled();

    // wait 5 seconds for no reason (SADLY THIS IS IMPORTANT FOR THE TEST TO PASS)
    await page.waitForTimeout(5000);

    // Click the "Encrypt" button
    await encryptButton.click();

    // wait for a while just to see what happens
    // await page.waitForTimeout(10000);

    // Wait for a modal with the text "Enter your password"
    await page.waitForSelector("text=Enter your password");

    // Find the input field with the name "password"
    const passwordInput2 = await page.locator(`input[name='password']`);

    // Type the password into the input field
    await passwordInput2.fill("test");

    // Click the "Decrypt Wallet" button
    await page.click("text=Decrypt Wallet");

    // Wait for an element matching the selector to appear in DOM.
    await page.locator(`text=0 sats`).first();
});
