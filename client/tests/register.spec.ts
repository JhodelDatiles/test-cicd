import { test, expect } from "@playwright/test";

// Helper function to generate dynamic emails per test execution
const generateUniqueEmail = () =>
  `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}@gmail.com`;

test.describe("Register E2E (Real Backend)", () => {
  test("creates an account and redirects home", async ({ page }) => {
    const email = generateUniqueEmail();
    const password = "P@ssw0rd";

    await page.goto("/register");
    await page.getByTestId("register-firstName").fill("Del");
    await page.getByTestId("register-lastName").fill("Datiles");
    await page.getByTestId("register-email").fill(email);
    await page.getByTestId("register-password").fill(password);

    // Wait for the server response and trigger the submit action
    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/auth/register") && res.status() === 201,
      ),
      page.getByTestId("register-submit").click(),
    ]);

    // Assert navigation to home route
    await page.waitForURL("**/");

    // Check that the welcome element renders and contains expected content
    await expect(page.getByTestId("home-welcome")).toBeVisible();
    await expect(page.getByTestId("home-welcome")).toContainText("Welcome");
  });

  test("shows an error when the email is already taken", async ({ page }) => {
    const existingEmail = generateUniqueEmail();
    const password = "P@ssw0rd";

    // Step 1: Register the account once to seed the database
    await page.goto("/register");
    await page.getByTestId("register-firstName").fill("Del");
    await page.getByTestId("register-lastName").fill("Datiles");
    await page.getByTestId("register-email").fill(existingEmail);
    await page.getByTestId("register-password").fill(password);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/auth/register") && res.status() === 201,
      ),
      page.getByTestId("register-submit").click(),
    ]);
    await page.waitForURL("**/");

    // Step 2: Attempt duplicate registration with the same credentials
    await page.goto("/register");
    await page.getByTestId("register-firstName").fill("Del");
    await page.getByTestId("register-lastName").fill("Datiles");
    await page.getByTestId("register-email").fill(existingEmail);
    await page.getByTestId("register-password").fill(password);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/auth/register") && res.status() === 400,
      ),
      page.getByTestId("register-submit").click(),
    ]);

    // Verify error display
    await expect(page.getByTestId("register-error")).toBeVisible();
    await expect(page.getByTestId("register-error")).toHaveText(
      "Email already exists", 
    );
  });
});
