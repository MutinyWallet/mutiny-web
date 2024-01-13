import { test } from "@playwright/test";

import { loadHome } from "./utils";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3420/");
});

test("initial load", async ({ page }) => {
    await loadHome(page);
});
