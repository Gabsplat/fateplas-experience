import { test, expect } from "@playwright/test";

test("renders local assets without hydration errors or horizontal overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  const externalAssets: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (
      request.frame() === page.mainFrame() &&
      ["image", "font", "stylesheet", "script"].includes(
        request.resourceType(),
      ) &&
      new URL(request.url()).origin !== new URL(page.url()).origin
    ) {
      externalAssets.push(request.url());
    }
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Seguridad, calidad",
  );
  await page.evaluate(() => document.fonts.ready);
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(fits).toBe(true);
  // Offscreen carousel clones are intentionally lazy. Load them explicitly to audit every asset.
  await page.evaluate(() => {
    for (const image of document.images) image.loading = "eager";
  });
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.images]
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute("src")),
      ),
    )
    .toEqual([]);
  expect(errors).toEqual([]);
  expect(externalAssets).toEqual([]);
});

test("navigation and FAQ work with touch and keyboard", async ({ page }) => {
  await page.goto("/");
  const toggle = page.locator(".menu-toggle");
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  }
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link", { name: "FAQ", exact: true })
    .click();
  await expect(page).toHaveURL(/#faq$/);
  const question = page.locator(".accordion-faq .accordion-trigger").first();
  await expect(question).toHaveAttribute("aria-expanded", "false");
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Enter");
  await expect(question).toHaveAttribute("aria-expanded", "false");
});

test("contact validates, preserves a failed submission, and confirms a retry", async ({
  page,
}) => {
  await page.goto("/#contacto");
  await page
    .getByRole("button", { name: "Enviar mensaje", exact: true })
    .click();
  await expect(page.locator("#contact-name")).toBeFocused();
  await expect(page.getByText("Revisá los campos indicados.")).toBeVisible();
  await page
    .getByLabel("Nombre", { exact: false })
    .fill("Prueba de formulario");
  await page.getByLabel("Email", { exact: false }).fill("prueba@example.com");
  await page
    .getByLabel("Asunto", { exact: false })
    .fill("Consulta de prueba sin envío externo.");
  const ids: string[] = [];
  await page.route("**/api/contact", async (route) => {
    ids.push(route.request().postDataJSON().submissionId);
    await route.fulfill({
      status: ids.length === 1 ? 503 : 201,
      json: {
        message:
          ids.length === 1
            ? "Error temporal de prueba."
            : "¡Gracias! Recibimos tu mensaje.",
      },
    });
  });
  await page
    .getByRole("button", { name: "Enviar mensaje", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Error temporal de prueba.",
  );
  await expect(page.locator("#contact-name")).toHaveValue(
    "Prueba de formulario",
  );
  await page
    .getByRole("button", { name: "Enviar mensaje", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "¡Gracias! Recibimos tu mensaje.",
  );
  await expect(page.locator("#contact-name")).toHaveValue("");
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
});

test("membrane layers reveal the matching details by keyboard and touch", async ({
  page,
}) => {
  await page.goto("/");
  const cover = page.getByRole("button", {
    name: "Ver cubierta de poliéster",
    exact: true,
  });
  await cover.focus();
  await page.keyboard.press("Enter");
  await expect(cover).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Libre de ftalatos", { exact: true }),
  ).toBeVisible();
  const matrix = page.getByRole("button", {
    name: "Ver matriz de pvc",
    exact: true,
  });
  await matrix.click();
  await expect(matrix).toHaveAttribute("aria-pressed", "true");
  await expect(cover).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("heading", { name: "Matriz de PVC", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Libre de ftalatos", { exact: true }),
  ).toHaveCount(0);
});
