import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3420/");
});

test("restore from seed @slow", async ({ page }) => {
    // should have 100k sats on-chain
    const TEST_SEED_WORDS =
        "rival hood review write spoon tide orange ill opera enrich clip acoustic";

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Mutiny Wallet/);

    // Wait for an element matching the selector to appear in DOM.
    await page.waitForSelector("text=0 SATS");

    console.log("Page loaded.");

    // Wait for a while just to make sure we can load everything
    await page.waitForTimeout(1000);

    // Navigate to settings
    const settingsLink = await page.getByRole("link", { name: "Settings" });

    settingsLink.click();

    // Wait for settings to load
    await page.waitForSelector("text=Settings");

    // Click the "Restore" link
    page.click("text=Restore");

    // There should be some warning text: "This will replace your existing wallet"
    await expect(page.locator("p")).toContainText([
        "This will replace your existing wallet"
    ]);

    let seedWords = TEST_SEED_WORDS.split(" ");

    // Find the input field with the name "words.0"
    for (let i = 0; i < 12; i++) {
        const wordInput = await page.locator(`input[name='words.${i}']`);

        // Type the seed words into the input field
        await wordInput.type(seedWords[i]);
    }

    // There should be a button with the text "Restore" and it should not be disabled
    const restoreButton = await page.locator("button", { hasText: "Restore" });
    await expect(restoreButton).not.toBeDisabled();

    restoreButton.click();

    // A modal should pop up, click the "Confirm" button
    const confirmButton = await page.locator("button", { hasText: "Confirm" });
    confirmButton.click();

    // Wait for the wallet to load
    await page.waitForSelector("img[alt='lightning']");

    // Eventually we should have a balance of 100k sats
    await page.waitForSelector("text=100,000 SATS");

    // Now we should clean up after ourselves and delete the wallet
    settingsLink.click();

    // Wait for settings to load
    await page.waitForSelector("text=Settings");

    // Click the "Restore" link
    page.click("text=Admin Page");

    // Clicke the Delete Everything button
    page.click("text=Delete Everything");

    // A modal should pop up, click the "Confirm" button
    const confirmDeleteButton = await page.locator("button", {
        hasText: "Confirm"
    });
    confirmDeleteButton.click();

    // Wait for the wallet to load
    // Wait for the wallet to load
    await page.waitForSelector("img[alt='lightning']");
});
