import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".clock-card")).toHaveCount(6);
});

test("Task 5: saved cities reorder dashboard clocks and persist after reload", async ({ page }) => {
  const manager = page.locator("#saved-cities-list");
  await expect(manager.locator(".saved-city-row")).toHaveCount(6);
  await expect(manager.locator(".saved-city-row").first()).toContainText("Lagos");
  await expect(page.locator(".clock-card h3").first()).toHaveText("Lagos");
  await page.getByRole("button", { name: "Move down Lagos" }).click();
  await expect(manager.locator(".saved-city-row").first()).toContainText("London");
  await expect(page.locator(".clock-card h3").first()).toHaveText("London");
  await page.reload();
  await expect(page.locator("#saved-cities-list .saved-city-row").first()).toContainText("London");
  await expect(page.locator(".clock-card h3").first()).toHaveText("London");
  await expect(page.getByRole("button", { name: "Move up London" })).toBeDisabled();
  await page.getByRole("button", { name: "Remove London" }).click();
  await expect(page.locator(".clock-card h3").first()).toHaveText("Lagos");
  await expect(page.locator("#saved-cities-count")).toContainText("5 of 100");
  await page.reload();
  await expect(page.locator("#saved-cities-list .saved-city-row")).toHaveCount(5);
});

test("Task 5: adding cities updates the manager and move controls on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator("#city-search").fill("Vienna");
  await page.getByRole("button", { name: "Add Vienna, Austria" }).click();
  await expect(page.locator("#saved-cities-list .saved-city-row")).toHaveCount(7);
  await expect(page.getByRole("button", { name: "Move down Vienna" })).toBeDisabled();
  await page.getByRole("button", { name: "Move up Vienna" }).click();
  await expect(page.locator("#saved-cities-list .saved-city-row").nth(5)).toContainText("Vienna");
  await page.getByRole("button", { name: "Remove Vienna" }).click();
  await expect(page.locator("#saved-cities-list .saved-city-row")).toHaveCount(6);
});
