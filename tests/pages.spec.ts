import { expect, test } from "@playwright/test";

test("static Pages demo loads assets and keeps contact as a placeholder", async ({
  page,
}) => {
  test.skip(!process.env.PAGES_PREVIEW_URL, "Requires a static Pages preview.");
  const errors: string[] = [];
  const apiRequests: string[] = [];
  const missing: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("/api/contact")) apiRequests.push(request.url());
  });
  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      response.url().startsWith(process.env.PAGES_PREVIEW_URL!)
    )
      missing.push(response.url());
  });
  await page.goto(process.env.PAGES_PREVIEW_URL!);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Seguridad, calidad",
  );
  await page.evaluate(() => {
    for (const image of document.images) image.loading = "eager";
  });
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.images]
          .filter((image) => !image.complete || !image.naturalWidth)
          .map((image) => image.src),
      ),
    )
    .toEqual([]);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator("#contact-name").fill("Prueba visual");
  await page.locator("#contact-email").fill("prueba@example.com");
  await page.locator("#contact-message").fill("No enviar esta consulta.");
  await page
    .getByRole("button", { name: "Enviar mensaje", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Vista previa: el formulario todavía no está habilitado.",
  );
  expect(apiRequests).toEqual([]);
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
});
