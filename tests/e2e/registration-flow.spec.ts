import { expect, test } from "@playwright/test";

const onePixelPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

test("landing page and important navigation render without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Adreach TikTok Seminar");
  await expect(page.getByText("TIKTOK SEMINAR 2026").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your details" })).toBeVisible();
  await expect(page.locator("[data-export-card]")).toBeVisible();
  expect(errors).toEqual([]);
});

test("client validation is specific and keeps entered data", async ({ page }) => {
  await page.goto("/#register");
  const name = page.getByLabel(/Full Name/);
  const email = page.getByLabel(/Email Address/);
  const mobile = page.getByLabel(/Mobile Number/);
  await name.fill("A");
  await email.fill("invalid");
  await mobile.fill("123");
  await expect(page.getByText("Enter at least 2 characters.")).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Enter a valid Pakistani mobile number.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Register & Generate Image/i })).toBeDisabled();
  await expect(name).toHaveValue("A");
});

test("photo upload opens an accessible cropper and updates preview text", async ({ page }) => {
  await page.goto("/#register");
  await page.getByLabel(/Full Name/).fill("Muhammad Wajahat Shah");
  await page.getByLabel(/Designation/).fill("Founder and Chief Executive Officer");
  await page.getByLabel("Photograph upload").setInputFiles({ name: "attendee.png", mimeType: "image/png", buffer: onePixelPng });
  await expect(page.locator(".crop-shell")).toBeVisible();
  await expect(page.getByRole("button", { name: "Use crop" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  await expect(page.locator("[data-export-card]")).toContainText("Muhammad Wajahat Shah");
  await expect(page.locator("[data-export-card]")).toContainText("Founder and Chief Executive Officer");
  await page.locator(".preview-column").screenshot({ path: "test-results/adreach-card-sample.png" });
});

test("valid details enable registration while export stays locked before persistence", async ({ page }) => {
  await page.goto("/#register");
  await page.getByLabel(/Full Name/).fill("Ali Khan");
  await page.getByLabel(/Mobile Number/).fill("03001234567");
  await page.getByLabel(/Email Address/).fill("ali@example.com");
  await page.getByLabel("Photograph upload").setInputFiles({ name: "attendee.png", mimeType: "image/png", buffer: onePixelPng });
  await page.getByLabel(/I consent/).check();
  const submit = page.getByRole("button", { name: /Register & Generate Image/i });
  await expect(submit).toBeEnabled({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: /Download Image/i })).toBeDisabled();
});

test("invalid photo is explained and crop cancel preserves form data", async ({ page }) => {
  await page.goto("/#register");
  await page.getByLabel(/Full Name/).fill("Ali Khan");
  const upload = page.getByLabel("Photograph upload");
  await upload.setInputFiles({ name: "notes.pdf", mimeType: "application/pdf", buffer: Buffer.from("not an image") });
  await expect(page.getByText("Choose a JPG, PNG, or WebP photograph.")).toBeVisible();
  await upload.setInputFiles({ name: "attendee.png", mimeType: "image/png", buffer: onePixelPng });
  await expect(page.locator(".crop-shell")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator(".crop-shell")).toBeHidden();
  await expect(page.getByLabel(/Full Name/)).toHaveValue("Ali Khan");
});

test("database error is announced, focused, and does not clear user data", async ({ page }) => {
  await page.goto("/#register");
  await page.getByLabel(/Full Name/).fill("Ali Khan");
  await page.getByLabel(/Mobile Number/).fill("03001234567");
  await page.getByLabel(/Email Address/).fill("ali-error@example.com");
  await page.getByLabel("Photograph upload").setInputFiles({ name: "attendee.png", mimeType: "image/png", buffer: onePixelPng });
  await page.getByLabel(/I consent/).check();
  await page.getByRole("button", { name: /Register & Generate Image/i }).click();
  const status = page.locator(".form-card [aria-live='polite']").first();
  await expect(status).toContainText(/temporarily unavailable|could not complete/i, { timeout: 15_000 });
  await expect(status).toBeFocused();
  await expect(page.getByLabel(/Email Address/)).toHaveValue("ali-error@example.com");
});

for (const width of [320, 360, 375, 390, 414, 768, 1024, 1280, 1440]) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
    await expect(page.locator(".form-card")).toBeVisible();
    await expect(page.locator(".preview-stage")).toHaveCSS("aspect-ratio", "1 / 1");
  });
}
