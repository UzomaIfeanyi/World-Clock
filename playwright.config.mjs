import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.mjs",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    browserName: "chromium",
    headless: true,
    viewport: { width: 1280, height: 800 }
  },
  webServer: {
    command: "python3 -m http.server 4173 --bind 127.0.0.1",
    url: baseURL,
    timeout: 30_000,
    reuseExistingServer: !process.env.CI
  }
});
