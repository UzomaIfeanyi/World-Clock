import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".clock-card")).toHaveCount(6);
});

test("time-format options remain synced with the dashboard and converter", async ({ page }) => {
  await page.locator("#setting-hour-format").selectOption("12");
  await expect(page.locator("#clock-format-12")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".clock-time").first()).toContainText(/am|pm/i);
  await page.locator("#clock-format-24").click();
  await expect(page.locator("#setting-hour-format")).toHaveValue("24");
  await page.locator("#setting-hour-format").selectOption("12");
  await page.reload();
  await expect(page.locator("#setting-hour-format")).toHaveValue("12");
  await expect(page.locator("#clock-format-12")).toHaveAttribute("aria-pressed", "true");
});

test("theme, date order and clock visibility update immediately and survive reload", async ({ page }) => {
  await page.locator("#setting-theme").selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator("#setting-date-format").selectOption("mdy");
  await expect(page.locator(".clock-date").first()).toContainText(/\b[A-Z][a-z]{2} \d{1,2}, 20\d\d/);
  await page.locator("#setting-clock-display").selectOption("digital");
  await expect(page.locator(".analog-clock").first()).toBeHidden();
  await expect(page.locator(".clock-time").first()).toBeVisible();
  await page.locator("#setting-clock-display").selectOption("analog");
  await expect(page.locator(".analog-clock").first()).toBeVisible();
  await expect(page.locator(".clock-time").first()).toBeHidden();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-date-format", "mdy");
  await expect(page.locator("html")).toHaveAttribute("data-clock-display", "analog");
  await expect(page.locator(".clock-time").first()).toBeHidden();
  await page.locator("#settings-reset").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-date-format", "dmy");
  await expect(page.locator("html")).toHaveAttribute("data-clock-display", "both");
  await expect(page.locator("#clock-format-24")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".clock-time").first()).toBeVisible();
  await expect(page.locator(".analog-clock").first()).toBeVisible();
  await expect(page.locator(".clock-card")).toHaveCount(6);
});

test("Settings controls remain usable from the mobile navigation", async ({ page }) => {
  await page.setViewportSize({width: 375, height: 812});
  await page.locator("#menu-button").click();
  await page.locator('.nav-link[href="#settings"]').click();
  await expect(page.locator("#sidebar")).not.toHaveClass(/open/);
  await expect(page.locator("#setting-theme")).toBeVisible();
  await page.locator("#setting-theme").selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
});
