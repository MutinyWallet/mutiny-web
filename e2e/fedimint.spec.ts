import { expect, test } from "@playwright/test";

const SIGNET_INVITE_CODE =
    "fed11qgqzc2nhwden5te0vejkg6tdd9h8gepwvejkg6tdd9h8garhduhx6at5d9h8jmn9wshxxmmd9uqqzgxg6s3evnr6m9zdxr6hxkdkukexpcs3mn7mj3g5pc5dfh63l4tj6g9zk4er";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3420/");
});

test("fedmint join, receive, send", async ({ page }) => {
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

    // Click "Manage Federations" link
    await page.click("text=Manage Federations");

    // Fill the input with the federation code
    await page.fill("input[name='federation_code']", SIGNET_INVITE_CODE);

    const addButton = await page.getByRole("button", { name: "Add" });

    // Click the "Add" button
    await addButton.click();

    // Wait for a header to appear with the text "MutinySignetFederation"
    await page.waitForSelector("text=MutinySignetFederation");

    // Navigate back home
    await page.goBack();
    await page.goBack();

    // Make sure there's a fedimint icon
    await expect(page.getByRole("img", { name: "community" })).toBeVisible();

    // Click the receive button
    await page.click("text=Receive");

    // Expect the url to conain receive
    await expect(page).toHaveURL(/.*receive/);

    // At least one h1 should show "0 sats"
    await expect(page.locator("h1")).toContainText(["0 SATS"]);

    // At least one h2 should show "0 USD"
    await expect(page.locator("h2")).toContainText(["$0 USD"]);

    // Type 100 into the input
    await page.locator("#sats-input").pressSequentially("100");

    // Now the h1 should show "100,000 sats"
    await expect(page.locator("h1")).toContainText(["100 SATS"]);

    // There should be a button with the text "Continue" and it should not be disabled
    const continueButton = await page.locator("button", {
        hasText: "Continue"
    });
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

    const lightningInvoice = value?.split("lightning=")[1];

    // Post the lightning invoice to the server
    const _response = await fetch(
        "https://faucet.mutinynet.com/api/lightning",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bolt11: lightningInvoice
            })
        }
    );

    // Wait for an h1 to appear in the dom that says "Payment Received"
    await page.waitForSelector("text=Payment Received", { timeout: 30000 });

    // Click the "Nice" button
    await page.click("text=Nice");

    // Make sure we have 100 sats in the fedimint balance
    await expect(
        page
            .locator("div")
            .filter({ hasText: /^100 SATS$/ })
            .nth(1)
    ).toBeVisible();

    // Now we send
    await page.click("text=Send");

    // type refund@lnurl-staging.mutinywallet.com
    const sendInput = await page.locator("input");
    await sendInput.fill("refund@lnurl-staging.mutinywallet.com");

    await page.click("text=Continue");

    // Wait two seconds (the destination doesn't show up immediately)
    // TODO: figure out how to not get an error without waiting
    await page.waitForTimeout(2000);

    // Type 90 into the input
    await page.locator("#sats-input").fill("90");

    // Now the h1 should show "90 sats"
    await expect(page.locator("h1")).toContainText(["90 SATS"]);

    // There should be a button with the text "Confirm Send" and it should not be disabled
    const confirmButton = await page.locator("button", {
        hasText: "Confirm Send"
    });
    await expect(confirmButton).not.toBeDisabled();

    confirmButton.click();

    // Wait for an h1 to appear in the dom that says "Payment Sent"
    await page.waitForSelector("text=Payment Sent", { timeout: 30000 });
});
