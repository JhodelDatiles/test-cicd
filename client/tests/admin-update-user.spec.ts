import { test, expect } from "@playwright/test";

const mockAdminUser = {
  id: "admin-1",
  email: "admin@example.com",
  role: "admin" as const,
};

const mockUser = {
  _id: "user-1",
  firstName: "jane",
  lastName: "doe",
  email: "jane@example.com",
  role: "user",
  createdAt: new Date().toISOString(),
};

const goToAdminAfterLogin = async (page: import("@playwright/test").Page) => {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(mockAdminUser.email);
  await page.getByTestId("login-password").fill("P@ssw0rd");
  await page.getByTestId("login-submit").click();
  await page.waitForURL("**/");

  // AuthProvider doesn't rehydrate on reload, so navigate client-side
  // instead of page.goto('/admin') to keep the in-memory session.
  await page.evaluate(() => {
    window.history.pushState({}, "", "/admin");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
};

test.describe("Admin update user", () => {
  test("edits a user from the modal and updates the table", async ({
    page,
  }) => {
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessToken: "mock-token",
          user: mockAdminUser,
        }),
      });
    });

    await page.route("**/crud/users", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([mockUser]),
        });
      } else {
        await route.continue();
      }
    });

    await page.route(`**/crud/users/${mockUser._id}`, async (route) => {
      if (route.request().method() === "PATCH") {
        const payload = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...mockUser, ...payload }),
        });
      } else {
        await route.continue();
      }
    });

    await goToAdminAfterLogin(page);

    await expect(
      page.getByTestId(`admin-user-row-${mockUser._id}`),
    ).toBeVisible();
    await page.getByTestId(`admin-user-row-${mockUser._id}`).click();

    await expect(page.getByTestId("edit-user-modal")).toBeVisible();
    await page.getByTestId("edit-user-firstName").fill("janet");

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(`/crud/users/${mockUser._id}`) &&
          res.request().method() === "PATCH",
      ),
      page.getByTestId("edit-user-submit").click(),
    ]);

    await expect(
      page.getByTestId(`admin-user-row-${mockUser._id}`),
    ).toContainText("janet");
  });

  test("shows an error when the update request fails", async ({ page }) => {
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessToken: "mock-token",
          user: mockAdminUser,
        }),
      });
    });

    await page.route("**/crud/users", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([mockUser]),
        });
      } else {
        await route.continue();
      }
    });

    await page.route(`**/crud/users/${mockUser._id}`, async (route) => {
      if (route.request().method() === "PATCH") {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: "Email already exists" }),
        });
      } else {
        await route.continue();
      }
    });

    await goToAdminAfterLogin(page);

    await page.getByTestId(`admin-user-row-${mockUser._id}`).click();
    await page.getByTestId("edit-user-email").fill("taken@example.com");
    await page.getByTestId("edit-user-submit").click();

    await expect(page.getByTestId("edit-user-error")).toBeVisible();
    await expect(page.getByTestId("edit-user-error")).toHaveText(
      "Email already exists",
    );
  });
});
