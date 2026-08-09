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

  await page.evaluate(() => {
    window.history.pushState({}, "", "/admin");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
};

test.describe("Admin delete user", () => {
  test("deletes a user after confirmation and removes the row", async ({
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
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "User deleted" }),
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

    // First click arms the confirmation, doesn't delete yet
    await page.getByTestId("edit-user-delete").click();
    await expect(page.getByTestId("edit-user-delete")).toHaveText(
      "Confirm delete",
    );
    await expect(
      page.getByTestId(`admin-user-row-${mockUser._id}`),
    ).toBeVisible();

    // Second click confirms
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(`/crud/users/${mockUser._id}`) &&
          res.request().method() === "DELETE",
      ),
      page.getByTestId("edit-user-delete").click(),
    ]);

    await expect(
      page.getByTestId(`admin-user-row-${mockUser._id}`),
    ).not.toBeVisible();
  });

  test("shows an error when the delete request fails", async ({ page }) => {
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
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      } else {
        await route.continue();
      }
    });

    await goToAdminAfterLogin(page);

    await page.getByTestId(`admin-user-row-${mockUser._id}`).click();
    await page.getByTestId("edit-user-delete").click();
    await page.getByTestId("edit-user-delete").click();

    await expect(page.getByTestId("edit-user-error")).toBeVisible();
    await expect(
      page.getByTestId(`admin-user-row-${mockUser._id}`),
    ).toBeVisible();
  });
});