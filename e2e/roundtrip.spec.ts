import { expect, test } from "@playwright/test";

import { loadHome, visitSettings } from "./utils";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3420/");
});

test("rountrip receive and send", async ({ page }) => {
    test.slow(); // tell playwright that this test is slow

    await loadHome(page);

    await page.locator("#fab").click();
    await page.locator("text=Receive").last().click();

    // Expect the url to contain receive
    await expect(page).toHaveURL(/.*receive/);

    // At least one h1 should show "0 sats"
    await expect(page.locator("h1")).toContainText(["0 SATS"]);

    // At least one h2 should show "0 USD"
    // await expect(page.locator("h2")).toContainText(["$0 USD"]);
    await page.waitForSelector("text=$0 USD");

    // Type 100000 into the input
    await page.locator("#sats-input").pressSequentially("100000");

    // Now the h1 should show "100,000 sats"
    await expect(page.locator("h1")).toContainText(["100,000 SATS"]);

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

    // The SVG's value property includes "lightning:l"
    expect(value).toContain("lightning:l");

    // Post the lightning invoice to the server
    const response = await fetch("https://faucet.mutinynet.com/api/lightning", {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            bolt11: value
        })
    });

    if (!response.ok) {
        response.text().then((text) => {
            throw new Error("failed to post invoice to faucet: " + text);
        });
    }

    // Wait for an h1 to appear in the dom that says "Payment Received"
    await page.waitForSelector("text=Payment Received", { timeout: 30000 });

    // Click the "Nice" button
    await page.click("text=Nice");

    // Now we send
    await page.locator("#fab").click();
    await page.locator("text=Send").click();

    // In the textarea with the placeholder "bitcoin:..." type refund@lnurl-staging.mutinywallet.com
    const sendInput = await page.locator("input");
    await sendInput.fill("refund@lnurl-staging.mutinywallet.com");

    await page.click("text=Continue");

    // Wait two seconds (the destination doesn't show up immediately)
    // TODO: figure out how to not get an error without waiting
    await page.waitForTimeout(2000);

    // Type 10000 into the input
    await page.locator("#sats-input").fill("10000");

    // Now the h1 should show "100,000 sats"
    await expect(page.locator("h1")).toContainText(["10,000 SATS"]);

    // There should be a button with the text "Confirm Send" and it should not be disabled
    const confirmButton = await page.locator("button", {
        hasText: "Confirm Send"
    });
    await expect(confirmButton).not.toBeDisabled();

    confirmButton.click();

    // Wait for an h1 to appear in the dom that says "Payment Sent"
    await page.waitForSelector("text=Payment Sent", { timeout: 30000 });

    // Click the "Nice" button to go home
    await page.click("text=Nice");

    // Click settings
    await visitSettings(page);

    // Click "lightning channels"
    await page.click("text=Lightning Channels");

    // Close the channel
    await page.getByText("You have 1 lightning channel.").waitFor();

    await page.click("text=Online Channels");

    // Idk why the node isn't ready to close channels right away
    await page.waitForTimeout(5000);

    await page.click("text=Close");

    await page.click("text=Confirm");

    // wait for the channel to close
    await page.waitForTimeout(5000);

    await page
        .getByText(
            "It looks like you don't have any channels yet. To get started, receive some sats over lightning, or swap some on-chain funds into a channel. Get your hands dirty!"
        )
        .waitFor();
});
