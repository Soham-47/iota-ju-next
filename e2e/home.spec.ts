import { expect, test } from "@playwright/test";

test("home page is available", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "IOTA JU Website" })).toBeVisible();
});
