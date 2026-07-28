import { expect, type Page, type Route, test } from "@playwright/test";

const selectors = {
  username: (page: Page) => page.getByLabel("Username"),
  password: (page: Page) => page.getByRole("textbox", { name: "Password" }),
  submit: (page: Page) =>
    page.getByRole("button", { name: "Create account" }),
  heading: (page: Page) =>
    page.getByRole("heading", { name: "Create your account" }),
};

const messages = {
  usernameEmpty: "Username cannot be empty!",
  usernameInvalid:
    /username.*(?:letters|numbers|underscore|invalid|characters)/i,
  usernameLength: "Username length must between 3-20!",
  usernameAvailable: "Username available!",
  passwordLength: "Password must be within 8-30 characters!",
  passwordComplexity: /Password must contains at least 3 types/i,
  passwordValid: "Password valid.",
};

async function openRegisterPage(page: Page) {
  await page.goto("/register");
  await expect(selectors.heading(page)).toBeVisible();
  await expect(selectors.submit(page)).toBeDisabled();
}

async function blurUsername(page: Page) {
  await selectors.password(page).click();
}

async function blurPassword(page: Page) {
  await selectors.heading(page).click();
}

async function mockUsernameExists(
  page: Page,
  exists: boolean,
): Promise<{ getRequestCount: () => number }> {
  let requestCount = 0;

  await page.route("**/api/users/exists**", async (route) => {
    requestCount += 1;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(exists),
    });
  });

  return {
    getRequestCount: () => requestCount,
  };
}

test.describe("register page", () => {
  test.beforeEach(async ({ page }) => {
    await openRegisterPage(page);
  });

  test("validates username on blur", async ({ page }) => {
    const usernameApi = await mockUsernameExists(page, false);

    await selectors.username(page).focus();
    await selectors.heading(page).click();

    await expect(page.getByText(messages.usernameEmpty)).toBeVisible();
    await expect(selectors.submit(page)).toBeDisabled();

    await selectors.username(page).fill("ab!");
    await blurUsername(page);

    await expect(page.getByText(messages.usernameEmpty)).toBeHidden();
    await expect(page.getByText(messages.usernameInvalid)).toBeVisible();
    expect(usernameApi.getRequestCount()).toBe(0);

    await selectors.username(page).fill("ab");
    await blurUsername(page);

    await expect(page.getByText(messages.usernameLength)).toBeVisible();
    expect(usernameApi.getRequestCount()).toBe(0);

    const usernameCheckResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/users/exists") &&
        response.request().method() === "GET",
    );

    await selectors.username(page).fill("new_user");
    await blurUsername(page);
    await usernameCheckResponse;

    await expect(page.getByText(messages.usernameAvailable)).toBeVisible();
    expect(usernameApi.getRequestCount()).toBe(1);
  });

  test("validates password on blur", async ({ page }) => {
    await mockUsernameExists(page, false);

    const usernameCheckResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/users/exists") &&
        response.request().method() === "GET",
    );

    await selectors.username(page).fill("new_user");
    await blurUsername(page);
    await usernameCheckResponse;

    await expect(page.getByText(messages.usernameAvailable)).toBeVisible();

    await selectors.password(page).fill("abc");
    await blurPassword(page);

    await expect(page.getByText(messages.passwordLength)).toBeVisible();
    await expect(selectors.submit(page)).toBeDisabled();

    await selectors.password(page).fill("abcdefgh");
    await blurPassword(page);

    await expect(page.getByText(messages.passwordComplexity)).toBeVisible();
    await expect(selectors.submit(page)).toBeDisabled();

    await selectors.password(page).fill("Abcdefg1");
    await blurPassword(page);

    await expect(page.getByText(messages.passwordValid)).toBeVisible();
    await expect(selectors.submit(page)).toBeEnabled();
  });

  test("shows duplicate username error from async blur check", async ({
    page,
  }) => {
    const usernameApi = await mockUsernameExists(page, true);

    const usernameCheckResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/users/exists") &&
        response.request().method() === "GET",
    );

    await selectors.username(page).fill("taken_user");
    await blurUsername(page);
    await usernameCheckResponse;

    await expect(
      page.getByText("Username taken_user exists!", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(messages.usernameAvailable)).toBeHidden();
    await expect(selectors.submit(page)).toBeDisabled();

    expect(usernameApi.getRequestCount()).toBe(1);
  });

  test("does not check username remotely when local validation fails", async ({
    page,
  }) => {
    const usernameApi = await mockUsernameExists(page, false);

    for (const username of ["", "ab", "ab!"]) {
      await selectors.username(page).fill(username);
      await blurUsername(page);
    }

    expect(usernameApi.getRequestCount()).toBe(0);
  });

  test("blocks register request until both fields are valid", async ({
    page,
  }) => {
    let createUserCount = 0;

    await page.route("**/api/users", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      createUserCount += 1;

      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Should not be called" }),
      });
    });

    await selectors.username(page).fill("new_user");
    await selectors.password(page).fill("weakpass");

    await expect(selectors.submit(page)).toBeDisabled();

    await selectors.submit(page).click({ force: true });

    await expect.poll(() => createUserCount).toBe(0);
  });

  test("submits registration when both fields are valid", async ({ page }) => {
    await mockUsernameExists(page, false);

    let submittedBody: unknown;

    await page.route("**/api/users", async (route: Route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      submittedBody = route.request().postDataJSON();

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          username: "new_user",
        }),
      });
    });

    const usernameCheckResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/users/exists") &&
        response.request().method() === "GET",
    );

    await selectors.username(page).fill("new_user");
    await blurUsername(page);
    await usernameCheckResponse;

    await selectors.password(page).fill("Abcdefg1");
    await blurPassword(page);

    await expect(page.getByText(messages.usernameAvailable)).toBeVisible();
    await expect(page.getByText(messages.passwordValid)).toBeVisible();
    await expect(selectors.submit(page)).toBeEnabled();

    const registerResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/users") &&
        response.request().method() === "POST",
    );

    await selectors.submit(page).click();

    const response = await registerResponse;
    expect(response.status()).toBe(201);

    expect(submittedBody).toEqual({
      username: "new_user",
      password: "Abcdefg1",
    });
  });

  test("keeps submit disabled when username availability check fails", async ({
    page,
  }) => {
    await page.route("**/api/users/exists**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal server error" }),
      });
    });

    const usernameCheckResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/users/exists") &&
        response.request().method() === "GET",
    );

    await selectors.username(page).fill("new_user");
    await blurUsername(page);
    await usernameCheckResponse;

    await selectors.password(page).fill("Abcdefg1");
    await blurPassword(page);

    await expect(selectors.submit(page)).toBeDisabled();
  });
});
