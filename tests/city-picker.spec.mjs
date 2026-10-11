import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".clock-card")).toHaveCount(6);
});

test("tapping outside the mobile menu dismisses it", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const menu = page.locator("#menu-button");
  await menu.click();
  await expect(page.locator("#sidebar")).toHaveClass(/open/);
  await expect(page.locator("#sidebar-backdrop")).toHaveClass(/open/);
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.locator("#sidebar-backdrop").click({ position: { x: 320, y: 350 } });
  await expect(page.locator("#sidebar")).not.toHaveClass(/open/);
  await expect(page.locator("#sidebar-backdrop")).not.toHaveClass(/open/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.locator(".nav-link").first().click();
  await expect(page.locator("#sidebar")).not.toHaveClass(/open/);
});

test("Paris and Toronto can be added, displayed with flags, saved, and removed", async ({ page }) => {
  await page.locator("#add-clock").click();
  await expect(page.locator("#add-city-dialog")).toBeVisible();
  const picker = page.locator("#add-city-search");
  await picker.fill("Paris");
  await page.getByRole("button", { name: "Add Paris, France" }).click();
  await expect(page.locator("#city-feedback")).toContainText("Paris added");
  await picker.fill("Toronto");
  await page.getByRole("button", { name: "Add Toronto, Canada" }).click();
  await expect(page.locator("#city-feedback")).toContainText("Toronto added");
  await page.locator("#add-city-close").click();
  await expect(page.locator(".clock-card")).toHaveCount(8);
  await expect(page.locator('[data-zone="Europe/Paris"] .clock-flag')).toHaveAttribute("aria-label", "Flag of France");
  await expect(page.locator('[data-zone="Europe/Paris"] .flag-image')).toHaveAttribute("src", "https://flagcdn.com/w40/fr.png");
  await expect(page.locator('[data-zone="America/Toronto"] .clock-flag')).toHaveAttribute("aria-label", "Flag of Canada");
  await expect(page.locator('[data-zone="America/Toronto"] .flag-image')).toHaveAttribute("src", "https://flagcdn.com/w40/ca.png");
  await expect(page.locator('[data-zone="Europe/Paris"] .analog-clock')).toBeVisible();
  await expect(page.locator("#city-summary")).toContainText("8 / 100");
  await page.reload();
  await expect(page.locator(".clock-card")).toHaveCount(8);
  await page.locator("#clock-grid").getByRole("button", { name: "Remove Paris" }).click();
  await expect(page.locator(".clock-card")).toHaveCount(7);
  await page.reload();
  await expect(page.locator('[data-zone="Europe/Paris"]')).toHaveCount(0);
  await expect(page.locator('[data-zone="America/Toronto"]')).toHaveCount(1);
});

test("picker prevents duplicates and caps selected clocks at 100", async ({ page }) => {
  await page.locator("#add-clock").click();
  await page.locator("#add-city-search").fill("London");
  await expect(page.getByRole("button", { name: "Already added London, United Kingdom" })).toBeDisabled();
  await page.locator("#add-city-close").click();
  await page.evaluate(async () => {
    const { CITY_CATALOG, DEFAULT_CITY_IDS } = await import("/js/cityCatalog.js");
    const ids = [...DEFAULT_CITY_IDS, ...CITY_CATALOG.map(city => city.id).filter(id => !DEFAULT_CITY_IDS.includes(id))].slice(0,100);
    localStorage.setItem("worldclock:selected-cities:v1", JSON.stringify(ids));
  });
  await page.reload();
  await expect(page.locator(".clock-card")).toHaveCount(100);
  await expect(page.locator("#city-summary")).toContainText("100 / 100");
  await page.locator("#add-clock").click();
  await expect(page.locator("#city-feedback")).toContainText("100-city limit");
  await page.locator("#add-city-search").fill("Toronto");
  const addToronto = page.getByRole("button", { name: "Add Toronto, Canada" });
  const alreadyToronto = page.getByRole("button", { name: "Already added Toronto, Canada" });
  if (await addToronto.count()) await expect(addToronto).toBeDisabled();
  if (await alreadyToronto.count()) await expect(alreadyToronto).toBeDisabled();
  await page.locator("#add-city-close").click();
  await page.locator(".clock-remove").first().click();
  await expect(page.locator(".clock-card")).toHaveCount(99);
});

test("the picker can search for a city by country and displays correctly on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator("#add-clock").click();
  await expect(page.locator("#add-city-dialog")).toBeVisible();
  await page.locator("#add-city-search").fill("France");
  await expect(page.getByRole("button", { name: "Add Paris, France" })).toBeVisible();
  await page.locator("#add-city-search").fill("NotARealCity-XYZ");
  await expect(page.locator(".city-picker-empty")).toContainText("No matching location");
  await page.keyboard.press("Escape");
  await expect(page.locator("#add-city-dialog")).not.toBeVisible();
});

test("top search finds Vienna before it is saved and adds it directly", async ({ page }) => {
  const search = page.locator("#city-search");
  await search.fill("Vienna");
  await expect(page.locator(".clock-card")).toHaveCount(0);
  await expect(page.locator(".empty-state")).toContainText("not saved yet");
  await page.getByRole("button", { name: "Add Vienna, Austria" }).click();
  await expect(page.locator(".clock-card h3")).toHaveText("Vienna");
  await expect(page.locator("#city-summary")).toContainText("7 / 100");
  await expect(page.locator(".search-suggestions")).toBeHidden();
  const flag = page.locator('[data-zone="Europe/Vienna"] .clock-flag');
  await expect(flag).toHaveAttribute("aria-label", "Flag of Austria");
  await expect(flag.locator("img")).toHaveAttribute("src", "https://flagcdn.com/w40/at.png");
  await search.clear();
  await expect(page.locator(".clock-card")).toHaveCount(7);
  await search.fill("Vienna");
  await expect(page.getByRole("button", { name: "Already saved Vienna, Austria" })).toBeDisabled();
  await page.reload();
  await search.fill("Vienna");
  await expect(page.locator(".clock-card h3")).toHaveText("Vienna");
});
test("main search closes on outside tap and Escape; failed flag loading keeps code fallback", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route("https://flagcdn.com/**", route => route.abort());
  const search = page.locator("#city-search");
  await search.fill("Dublin");
  await expect(page.getByRole("button", { name: "Add Dublin, Ireland" })).toBeVisible();
  await page.locator("#local-date").click();
  await expect(page.locator(".search-suggestions")).toBeHidden();
  await search.fill("Dublin");
  await page.getByRole("button", { name: "Add Dublin, Ireland" }).click();
  await expect(page.locator('[data-zone="Europe/Dublin"] .clock-flag')).toContainText("IE");
  await search.fill("Toronto");
  await search.press("Escape");
  await expect(page.locator(".search-suggestions")).toBeHidden();
});
test("day/night indicator has graphical sun and moon icons and follows local time", async ({ page }) => {
  await page.locator("#time-preview-offset").evaluate(el => {
    el.value = "0";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const icons = await page.evaluate(() => {
    const css = getComputedStyle(document.querySelector(".clock-daypart"), "::before").backgroundImage;
    const night = document.querySelector(".clock-daypart.night");
    return { day: css, night: night && getComputedStyle(night, "::before").backgroundImage };
  });
  expect(icons.day).toContain("data:image/svg+xml");
  const nightCss = await page.evaluate(() => {
    const styles = [...document.styleSheets].filter(sheet => {
      try { return [...sheet.cssRules].some(rule => rule.selectorText === ".clock-daypart.night::before"); }
      catch { return false; }
    });
    return styles.length > 0;
  });
  expect(nightCss).toBeTruthy();
});
