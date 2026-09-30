import { expect, test } from "@playwright/test";

test("material, press selection and quote work without overwriting a draft", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Cada capa cuenta." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Pausar animaciones", exact: true })
    .click();
  await expect(page.locator(".experience")).toHaveAttribute(
    "data-paused",
    "true",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `docs/reference/experience/hero-${testInfo.project.name}.png`,
  });
  await page
    .locator("#materiales")
    .getByRole("button", { name: "Matriz", exact: true })
    .click();
  await expect(page.getByText("7,8 MPa", { exact: true })).toBeVisible();
  await page
    .locator("#materiales")
    .getByRole("button", { name: "Soporte", exact: true })
    .click();
  await expect(page.getByText("1100 dTex", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Diemme", exact: true }).click();
  await expect(
    page.getByRole("img", { name: "Prensa Diemme Velvet T26" }),
  ).toBeVisible();
  await page.getByLabel("Modelo de la prensa").fill("Velvet T26");
  await page.getByRole("link", { name: "Consultar por esta membrana" }).click();
  await expect(page.locator("#contact-message")).toHaveValue(
    "Quisiera consultar por una membrana para una prensa Diemme, modelo Velvet T26.",
  );
  await page.locator("#contact-name").fill("Mi nombre");
  await page.locator("#contact-message").fill("Mi consulta escrita a mano.");
  await page.getByRole("button", { name: "Willmes", exact: true }).click();
  await page.getByRole("link", { name: "Consultar por esta membrana" }).click();
  await expect(page.locator("#contact-message")).toHaveValue(
    "Mi consulta escrita a mano.",
  );
  await expect(page.locator("#contact-name")).toHaveValue("Mi nombre");
  await page
    .getByRole("button", { name: "Enviar mensaje", exact: true })
    .click();
  await expect(page.locator(".contact-form").getByRole("status")).toContainText(
    "Vista previa",
  );
  await page.getByRole("button", { name: "¿Qué incluye el servicio?" }).click();
  await expect(page.locator("#faq-answer-0")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("film playback, mute, pause and dialog focus restoration", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Industria", exact: true }).click();
  const video = page.locator(".hero-film");
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(0);
  await page
    .getByRole("button", { name: "Pausar animaciones", exact: true })
    .click();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(true);
  await page.getByRole("button", { name: "Ver película" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const film = dialog.locator("video");
  await expect
    .poll(() =>
      film.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(0);
  await dialog
    .getByRole("button", { name: "Activar sonido", exact: true })
    .click();
  await expect
    .poll(() => film.evaluate((element: HTMLVideoElement) => element.muted))
    .toBe(false);
  await dialog.getByRole("button", { name: "Pausar", exact: true }).click();
  await expect
    .poll(() => film.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Ver película" }),
  ).toBeFocused();
});

test("reduced motion keeps content and keyboard interactions accessible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Cada capa cuenta." }),
  ).toBeVisible();
  await expect
    .poll(() => page.locator(".experience").getAttribute("data-paused"))
    .toBe("true");
  const layer = page
    .locator("#materiales")
    .getByRole("button", { name: "Matriz", exact: true });
  await layer.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("7,8 MPa", { exact: true })).toBeVisible();
  await expect(layer).toBeFocused();
  await page.getByRole("button", { name: "Industria", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator(".hero-film")
        .evaluate((element: HTMLVideoElement) => element.paused),
    )
    .toBe(true);
  expect(
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll(
          ".hero-stage *:not(source), .type-ribbon > div, .repair-sheet i",
        ),
      ).every((element) => getComputedStyle(element).animationName === "none"),
    ),
  ).toBe(true);
});
