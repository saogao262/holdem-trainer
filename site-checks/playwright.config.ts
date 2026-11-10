import { defineConfig, devices } from "@playwright/test";

// Used by GitHub Actions in the public site repo, which holds only this folder and the built site.
export default defineConfig({
  testDir: ".",
  retries: 1,
  reporter: [["list"]],
  use: { ...devices["Desktop Chrome"], baseURL: process.env.LIVE_URL ?? "https://saogao262.github.io/holdem-trainer/" },
});
