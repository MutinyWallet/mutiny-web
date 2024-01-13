import { expect, test } from "@playwright/test";

import { visitSettings } from "./utils";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3420/");
});

test("restore from seed @slow", async ({ page }) => {
    // Start on the home page
    await expect(page).toHaveTitle(/Mutiny Wallet/);
    await page.waitForSelector("text=Welcome to the Mutiny!");

    console.log("Waiting for new wallet to be created...");

    await page.locator(`button:has-text('Import Existing')`).click();

    // should have 100k sats on-chain
    const TEST_SEED_WORDS =
        "rival hood review write spoon tide orange ill opera enrich clip acoustic";

    // There should be some warning text: "This will replace your existing wallet"
    await expect(page.locator("p")).toContainText([
        "This will replace your existing wallet"
    ]);

    const seedWords = TEST_SEED_WORDS.split(" ");

    // Find the input field with the name "words.0"
    for (let i = 0; i < 12; i++) {
        const wordInput = await page.locator(`input[name='words.${i}']`);

        // Type the seed words into the input field
        await wordInput.fill(seedWords[i]);
    }

    // There should be a button with the text "Restore" and it should not be disabled
    const restoreButton = await page.locator("button", { hasText: "Restore" });
    await expect(restoreButton).not.toBeDisabled();

    restoreButton.click();

    // A modal should pop up, click the "Confirm" button
    const confirmButton = await page.locator("button", { hasText: "Confirm" });
    await confirmButton.click();

    // Eventually we should have a balance of 100k sats
    await page.locator("text=100,000 SATS");

    // Now we should clean up after ourselves and delete the wallet
    await visitSettings(page);

    // Click the "Restore" link
    await page.click("text=Admin Page");

    // Clicke the Delete Everything button
    await page.click("text=Delete Everything");

    // A modal should pop up, click the "Confirm" button
    const confirmDeleteButton = await page.locator("button", {
        hasText: "Confirm"
    });

    // wait 5 seconds for no reason
    await page.waitForTimeout(5000);

    await confirmDeleteButton.click();

    await page.locator("text=Welcome to the Mutiny!");
});
