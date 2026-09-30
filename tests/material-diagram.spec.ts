import { expect, test } from "@playwright/test";

test("technical diagram selects the original surfaces and preserves its image", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const section = page.locator("#materiales");
  const diagram = section.getByRole("group", {
    name: "Capas de la tela de la membrana",
    exact: true,
  });
  const image = diagram.locator("image");
  await expect(image).toHaveCount(1);
  await expect(image).toHaveAttribute("href", /membrane-layers\.png$/);
  const initialGeometry = await image.evaluate((element) => element.outerHTML);
  const matrix = section.getByRole("button", {
    name: "Ver matriz de pvc",
    exact: true,
  });
  const support = section.getByRole("button", {
    name: "Ver soporte de poliéster",
    exact: true,
  });
  await matrix.scrollIntoViewIfNeeded();
  await matrix.click();
  await support.click();
  await matrix.click();
  await expect(matrix).toHaveAttribute("aria-pressed", "true");
  await expect(support).toHaveAttribute("aria-pressed", "false");
  const panel = page.locator(
    `[id="${await matrix.getAttribute("aria-controls")}"]`,
  );
  await expect(panel.getByRole("heading")).toHaveText("Matriz de PVC");
  await expect(panel.getByText("7,8 MPa", { exact: true })).toBeVisible();
  await section.getByRole("button", { name: "Soporte", exact: true }).click();
  await expect(panel.getByText("1100 dTex", { exact: true })).toBeVisible();
  await expect(support).toHaveAttribute("aria-pressed", "true");
  await section.screenshot({
    path: `docs/reference/experience/material-${testInfo.project.name}.png`,
  });
  await section
    .getByRole("button", { name: "Volver a cubierta", exact: true })
    .click();
  await expect(panel.getByRole("heading")).toHaveText("Cubierta de poliéster");
  await expect(panel.getByText("60 °C", { exact: true })).toBeVisible();
  expect(await image.evaluate((element) => element.outerHTML)).toBe(
    initialGeometry,
  );
  expect(
    await diagram
      .locator("[data-material-layer]")
      .evaluateAll((elements) =>
        elements.every(
          (element) => getComputedStyle(element).transform === "none",
        ),
      ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("keyboard selects, resets and keeps the reduced motion diagram still", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator("#materiales");
  const support = section.getByRole("button", {
    name: "Ver soporte de poliéster",
    exact: true,
  });
  await support.focus();
  await page.keyboard.press(" ");
  await expect(support).toHaveAttribute("aria-pressed", "true");
  await expect(support).toBeFocused();
  await expect(
    section.getByRole("heading", { name: "Soporte de poliéster", exact: true }),
  ).toBeVisible();
  expect(
    await section
      .locator("svg *")
      .evaluateAll(
        (elements) =>
          elements
            .flatMap((element) => element.getAnimations())
            .filter((animation) => animation.playState === "running").length,
      ),
  ).toBe(0);
  await page.keyboard.press("Escape");
  await expect(
    section.getByRole("heading", {
      name: "Cubierta de poliéster",
      exact: true,
    }),
  ).toBeVisible();
  await expect(support).toBeFocused();
  await expect(
    section.getByRole("button", { name: "Recorrer las capas", exact: true }),
  ).toHaveCount(0);
});
