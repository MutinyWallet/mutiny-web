import { expect, test } from "@playwright/test";

import { loadHome } from "./utils";

const SIGNET_INVITE_CODE =
    "fed11qgqzc2nhwden5te0vejkg6tdd9h8gepwvejkg6tdd9h8garhduhx6at5d9h8jmn9wshxxmmd9uqqzgxg6s3evnr6m9zdxr6hxkdkukexpcs3mn7mj3g5pc5dfh63l4tj6g9zk4er";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3420/");
});

test("fedmint join, receive, send", async ({ page }) => {
    await loadHome(page);

    // Click "Join a federation" cta
    await page.click("text=Join a federation");

    // Fill the input with the federation code
    await page.fill("input[name='federation_code']", SIGNET_INVITE_CODE);

    await page.getByText("Mutinynet Signet Federation").waitFor();

    const addButton = await page.getByRole("button", { name: "Add" }).first();

    // Click the "Add" button
    await addButton.click();

    // Wait for a header to appear with the text "MutinySignetFederation"
    await page.getByText("MutinySignetFederation").waitFor();

    // Navigate back home
    await page.goBack();

    // Click the top left button (it's the profile button), a child of header
    // TODO: better ARIA stuff
    await page.locator(`header button`).first().click();

    // Make sure there's text that says "fedimint"
    await page.locator("text=fedimint").first();

    // Navigate back home
    await page.goBack();

    // Click the fab button
    await page.locator("#fab").click();
    // Click the receive button in the fab
    await page.locator("text=Receive").last().click();

    // Expect the url to conain receive
    await expect(page).toHaveURL(/.*receive/);

    // At least one h1 should show "0 sats"
    await expect(page.locator("h1")).toContainText(["0 SATS"]);

    // Type 100 into the input
    await page.locator("#sats-input").pressSequentially("100");

    // Now the h1 should show "100,000 sats"
    await expect(page.locator("h1")).toContainText(["100 SATS"]);

    // There should be a button with the text "Continue" and it should not be disabled
    const continueButton = await page.locator("button", {
        hasText: "Continue"
    });
    await expect(continueButton).not.toBeDisabled();

    await continueButton.click();

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
    await page.waitForSelector("text=Payment Received");

    // Click the "Nice" button
    await page.click("text=Nice");

    // Make sure we have 100 sats in the top balance
    await page.waitForSelector("text=100 SATS");

    // Now we send
    await page.locator("#fab").click();
    await page.locator("text=Send").last().click();

    // type refund@lnurl-staging.mutinywallet.com
    const sendInput = await page.locator("input");
    await sendInput.fill("refund@lnurl-staging.mutinywallet.com");

    await page.click("text=Continue");

    // Wait for the destination to show up
    await page.waitForSelector("text=LIGHTNING");

    // Type 90 into the input
    await page.locator("#sats-input").fill("90");

    // Now the h1 should show "90 sats"
    await expect(page.locator("h1")).toContainText(["90 SATS"]);

    // There should be a button with the text "Confirm Send" and it should not be disabled
    const confirmButton = await page.locator("button", {
        hasText: "Confirm Send"
    });
    await expect(confirmButton).not.toBeDisabled();

    await confirmButton.click();

    // Wait for an h1 to appear in the dom that says "Payment Sent"
    await page.waitForSelector("text=Payment Sent");
});
