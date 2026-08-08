import { test, expect } from "@playwright/test";

// Helper to generate a unique email per run so registration doesn't fail on existing records
const generateUniqueEmail = () =>
  `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}@gmail.com`;

test.describe("Login E2E (Real Backend)", () => {
  test("logs in and redirects home", async ({ page }) => {
    const email = generateUniqueEmail();
    const password = "P@ssw0rd";

    // Step 1: Register a real user first so credentials exist in the backend DB
    await page.goto("/register");
    await page.getByTestId("register-firstName").fill("Del");
    await page.getByTestId("register-lastName").fill("Datiles");
    await page.getByTestId("register-email").fill(email);
    await page.getByTestId("register-password").fill(password);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/auth/register") && res.status() === 201,
      ),
      page.getByTestId("register-submit").click(),
    ]);

    await page.waitForURL("**/");

    // Step 2: Clear state to simulate a fresh login session
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Step 3: Perform real login (navigating to '/' where Login is routed)
    await page.goto("/login");
    await page.getByTestId("login-email").fill(email);
    await page.getByTestId("login-password").fill(password);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/auth/login") && res.status() === 200,
      ),
      page.getByTestId("login-submit").click(),
    ]);

    // Assert navigation and state
    await page.waitForURL("**/");
    await expect(page.getByTestId("home-welcome")).toBeVisible();
    await expect(page.getByTestId("home-welcome")).toContainText("Welcome");
  });

  test("shows an error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("nonexistent_user@example.com");
    await page.getByTestId("login-password").fill("WrongPassword123!");

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/auth/login") && res.status() === 401,
      ),
      page.getByTestId("login-submit").click(),
    ]);

    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page.getByTestId("login-error")).toHaveText(
      "Invalid credentials",
    );
  });
});
