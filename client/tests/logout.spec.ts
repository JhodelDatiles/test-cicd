import { test, expect } from "@playwright/test";

const mockUser = {
  id: "user-1",
  email: "jane@example.com",
  role: "user" as const,
};

const login = async (page: import("@playwright/test").Page) => {
  await page.route("**/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ accessToken: "mock-token", user: mockUser }),
    });
  });

  await page.goto("/login");
  await page.getByTestId("login-email").fill(mockUser.email);
  await page.getByTestId("login-password").fill("P@ssw0rd");
  await page.getByTestId("login-submit").click();
  await page.waitForURL("**/");
};

test.describe("Logout", () => {
  test("logs out and redirects to login", async ({ page }) => {
    await login(page);

    await page.route("**/auth/logout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Logged out" }),
      });
    });

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/auth/logout") &&
          res.request().method() === "POST",
      ),
      page.getByTestId("logout-button").click(),
    ]);

    await page.waitForURL("**/login");
    await expect(page.getByTestId("login-form")).toBeVisible();

    // Session is gone — a fresh visit to the protected route bounces back to login
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("clears session locally even if the logout request fails", async ({
    page,
  }) => {
    await login(page);

    await page.route("**/auth/logout", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    await page.getByTestId("logout-button").click();

    await page.waitForURL("**/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
  });
});
