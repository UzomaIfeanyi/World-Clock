import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".clock-card")).toHaveCount(6);
});

test("dashboard integrates six timezone cards, analog faces and live digital time", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await expect(page.locator(".analog-clock")).toHaveCount(6);
  await expect(page.locator("#local-date")).not.toBeEmpty();
  await expect(page.locator('[data-zone="Africa/Lagos"] .clock-time')).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
  await expect(page.locator('[data-zone="Asia/Tokyo"] .analog-clock')).toHaveAttribute("aria-label", /Analog time in Asia\/Tokyo/);
  expect(errors).toEqual([]);
});

test("search filters city and country, including the empty state", async ({ page }) => {
  const search = page.locator("#city-search");
  await search.fill("Nigeria");
  await expect(page.locator(".clock-card")).toHaveCount(1);
  await expect(page.locator(".clock-card h3")).toHaveText("Lagos");
  await search.fill("toKYo");
  await expect(page.locator(".clock-card h3")).toHaveText("Tokyo");
  await search.fill("no-such-place");
  await expect(page.locator(".clock-card")).toHaveCount(0);
  await expect(page.locator(".empty-state")).toContainText("No cities match");
  await search.clear();
  await expect(page.locator(".clock-card")).toHaveCount(6);
  await expect(page.locator(".analog-clock")).toHaveCount(6);
});

test("12/24-hour preference applies to cards and persists across reloads", async ({ page }) => {
  await page.locator("#clock-format-12").click();
  await expect(page.locator("#clock-format-12")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".clock-card").first().locator(".clock-time")).toContainText(/am|pm/i);
  await page.reload();
  await expect(page.locator("#clock-format-12")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#clock-format-24").click();
  await expect(page.locator("#clock-format-24")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".clock-card").first().locator(".clock-time")).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
});

test("time slider, its buttons and analog clocks stay synchronized", async ({ page }) => {
  await page.locator("#time-preview-forward").click();
  await expect(page.locator("#time-preview-label")).toHaveText("+0h 30m");
  await expect(page.locator("#time-preview-date")).not.toBeEmpty();
  await expect(page.locator(".analog-clock")).toHaveCount(6);
  await page.locator("#time-preview-back").click();
  await expect(page.locator("#time-preview-label")).toHaveText("Live / current time");
  await page.locator("#time-preview-offset").evaluate(el => {
    el.value = "-120";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#time-preview-label")).toHaveText("−2h 00m");
  await page.locator("#time-preview-reset").click();
  await expect(page.locator("#time-preview-offset")).toHaveValue("0");
  await expect(page.locator("#time-preview-label")).toHaveText("Live / current time");
});

test("time converter respects UK winter/summer clocks and compares cities", async ({ page }) => {
  const date = page.locator("#convert-date");
  const time = page.locator("#convert-time");
  await expect(page.locator("#convert-from")).toBeVisible();
  await page.locator("#convert-from").selectOption("Africa/Lagos");
  await page.locator("#convert-to").selectOption("Europe/London");
  await date.fill("2026-01-15");
  await time.fill("12:00");
  await expect(page.locator("#converter-result")).toContainText(/London: 11:00:00/);
  await date.fill("2026-07-15");
  await expect(page.locator("#converter-result")).toContainText(/London: 12:00:00/);
  await expect(page.locator(".converter-city")).toHaveCount(6);
});

test("converter warns when DST skips or repeats a local time", async ({ page }) => {
  await page.locator("#convert-from").selectOption("Europe/London");
  await page.locator("#convert-date").fill("2026-03-29");
  await page.locator("#convert-time").fill("01:30");
  await expect(page.locator("#converter-result")).toContainText("does not exist");
  await page.locator("#convert-date").fill("2026-10-25");
  await expect(page.locator("#converter-note")).toContainText("occurs twice");
  await expect(page.locator(".converter-city")).toHaveCount(6);
});

test("mobile navigation opens, closes with Escape and closes after navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const menu = page.locator("#menu-button");
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#sidebar")).toHaveClass(/open/);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.locator('.nav-link[href="#converter"]').click();
  await expect(page).toHaveURL(/#converter$/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});
