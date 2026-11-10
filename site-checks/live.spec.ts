import { expect, test } from "@playwright/test";

// Quick checks against the deployed site, as a first-time visitor sees it. They run after each deploy and
// once a day on GitHub. This file stands alone (no app imports), because the public site repo holds only it
// and the built site.

function watchForErrors(page: import("@playwright/test").Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} for ${response.url()}`);
  });
  return errors;
}

test("the splash deals five cards, then the home page opens", async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto("./");
  await expect(page.locator(".splash-face")).toHaveCount(5);
  // Any tap skips the splash.
  await page.mouse.click(5, 5);
  await expect(page.locator(".splash-face")).toHaveCount(0);
  await expect(page.locator("main")).toContainText("Learn to play poker", { ignoreCase: true });
  expect(errors).toEqual([]);
});

test("the first lesson starts and takes an answer", async ({ page }) => {
  const errors = watchForErrors(page);
  await page.addInitScript(() => sessionStorage.setItem("holdem-trainer-splash-seen-v1", "1"));
  await page.goto("./#map?view=list");
  await page.locator("a.level").first().click();
  await expect(page.locator(".lesson-player")).toContainText("Step 1 of", { ignoreCase: true });
  expect(errors).toEqual([]);
});

test("Play deals a hand and offers your move", async ({ page }) => {
  const errors = watchForErrors(page);
  await page.addInitScript(() => sessionStorage.setItem("holdem-trainer-splash-seen-v1", "1"));
  await page.goto("./#play");
  await expect(page.locator(".seat")).toHaveCount(6);
  await expect(page.locator(".action-bar .action").first()).toBeVisible({ timeout: 30_000 });
  expect(errors).toEqual([]);
});

test("every tab opens", async ({ page }) => {
  const errors = watchForErrors(page);
  await page.addInitScript(() => sessionStorage.setItem("holdem-trainer-splash-seen-v1", "1"));
  for (const hash of ["#home", "#learn", "#map", "#play", "#drills", "#stats", "#debug"]) {
    await page.goto(`./${hash}`);
    await expect(page.locator("main"), hash).not.toBeEmpty();
  }
  expect(errors).toEqual([]);
});
