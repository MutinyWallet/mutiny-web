import { expect, Page } from "@playwright/test";

export async function loadHome(page: Page) {
    // Start on the home page
    await expect(page).toHaveTitle(/Mutiny Wallet/);
    await page.waitForSelector("text=Welcome to the Mutiny!");

    console.log("Waiting for new wallet to be created...");

    await page.locator(`button:has-text('New Wallet')`).click();

    await page.locator("text=Create your profile").first();

    await page.locator("button:has-text('Skip for now')").click();

    await page.getByText("Pick a Federation").waitFor();

    await page.locator("button:has-text('Skip for now')").click();

    await page.locator(`button:has-text('Confirm')`).click();

    // Should have a balance up top now
    await page.locator(`text=0 sats`).first().waitFor();
}

export async function visitSettings(page: Page) {
    // Find an image with an alt text of "mutiny" and click it
    // TODO: probably should have better ARIA stuff for this
    await page.locator("img[alt='mutiny']").first().click();
    await expect(page.locator("h1").first()).toHaveText("Settings");
}
