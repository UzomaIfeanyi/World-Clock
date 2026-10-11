import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".clock-card")).toHaveCount(6);
});

test("planner suggests local business-hour meetings and changes results with date", async ({ page }) => {
  await expect(page.locator("#planner-city-options input:checked")).toHaveCount(3);
  await page.locator("#planner-date").fill("2026-01-15");
  await expect(page.locator(".planner-slot").first()).toContainText("Lagos");
  await expect(page.locator(".planner-slot").first()).toContainText("London");
  await expect(page.locator(".planner-slot").first()).toContainText("New York");
  await expect(page.locator(".planner-slot").first().locator("h4")).toContainText("15:00");
  await page.locator("#planner-date").fill("2026-07-15");
  await expect(page.locator(".planner-slot").first().locator("h4")).toContainText("14:00");
  await page.locator("#planner-duration").selectOption("120");
  await expect(page.locator("#planner-status")).toContainText("suitable start time");
});

test("planner explains empty weekends and impossible overlap, then responds to city choice", async ({ page }) => {
  await page.locator("#planner-date").fill("2026-10-11");
  await expect(page.locator("#planner-status")).toContainText("No shared working-hour slots");
  await page.locator("#planner-date").fill("2026-10-12");
  const boxes=page.locator("#planner-city-options input");
  await boxes.nth(0).uncheck();
  await boxes.nth(1).uncheck();
  await boxes.nth(3).check();
  await expect(page.locator("#planner-status")).toContainText("No shared working-hour slots");
  await boxes.nth(3).uncheck();
  await expect(page.locator("#planner-status")).toContainText("Choose at least two");
});

test("planner survives reload, uses saved cities, and remains usable on mobile", async ({ page }) => {
  await page.setViewportSize({width:375,height:812});
  await page.locator("#planner-duration").selectOption("90");
  await page.locator("#planner-work-start").fill("08:00");
  await page.locator("#planner-work-end").fill("18:00");
  await page.reload();
  await expect(page.locator("#planner-duration")).toHaveValue("90");
  await expect(page.locator("#planner-work-start")).toHaveValue("08:00");
  await expect(page.locator("#planner-work-end")).toHaveValue("18:00");
  await page.locator("#city-search").fill("Vienna");
  await page.getByRole("button",{name:"Add Vienna, Austria"}).click();
  await expect(page.locator("#planner-city-options input")).toHaveCount(7);
  await page.locator("#saved-cities-list").getByRole("button",{name:"Remove London"}).click();
  await expect(page.locator("#planner-city-options input")).toHaveCount(6);
  await expect(page.locator("#planner-city-options")).not.toContainText("London · United Kingdom");
  await page.locator("#menu-button").click();
  await page.locator('.nav-link[href="#meeting-planner"]').click();
  await expect(page.locator("#planner-date")).toBeVisible();
});

test("planner result respects existing 12-hour and light mode settings", async ({ page }) => {
  await page.locator("#planner-date").fill("2026-01-15");
  await page.locator("#clock-format-12").click();
  await expect(page.locator(".planner-slot").first().locator("h4")).toContainText(/pm/i);
  await page.locator("#setting-theme").selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
  await expect(page.locator(".planner-slot").first()).toBeVisible();
});
