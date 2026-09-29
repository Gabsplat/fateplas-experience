import { expect, test } from "@playwright/test";

test("original membrane keeps its geometry and the latest selection during interaction", async ({
  page,
}) => {
  await page.goto("/");
  const matrix = page.getByRole("button", {
    name: "Ver matriz de pvc",
    exact: true,
  });
  const support = page.getByRole("button", {
    name: "Ver soporte de poliéster",
    exact: true,
  });
  await expect(
    page.getByRole("button", {
      name: "Ver cubierta de poliéster",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
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
  await expect(page.locator("[data-material-layer]")).toHaveCount(3);
  await expect(
    page
      .getByRole("group", {
        name: "Capas de la tela de la membrana",
        exact: true,
      })
      .locator("image"),
  ).toHaveCount(1);
  await expect
    .poll(() =>
      page
        .locator('[data-material-layer="1"]')
        .evaluate((node) => getComputedStyle(node).transform),
    )
    .toBe("none");
  await page
    .getByRole("button", { name: "Volver a cubierta", exact: true })
    .click();
  await expect(matrix).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("heading", { name: "Cubierta de poliéster", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("[data-material-layer]")
        .evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).transform === "none"),
        ),
    )
    .toBe(true);
});

test("reduced motion keeps membrane selection immediate and exposes no autoplay controls", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const support = page.getByRole("button", {
    name: "Ver soporte de poliéster",
    exact: true,
  });
  await support.focus();
  await page.keyboard.press("Enter");
  await expect(support).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", { name: "Soporte de poliéster", exact: true }),
  ).toBeVisible();
  const moving = await page
    .locator('[data-material-layer="2"]')
    .evaluate(
      (node) =>
        node
          .getAnimations()
          .filter((animation) => animation.playState === "running").length,
    );
  expect(moving).toBe(0);
  await expect(page.getByRole("button", { name: /^Pausar/ })).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(
    page.getByRole("button", { name: /Pausar|Reanudar/ }),
  ).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("button", { name: /^Pausar/ })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("hero slideshow can be advanced without playback controls", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Imágenes de la industria" });
  await expect(
    page.getByRole("button", { name: /Pausar|Reanudar/ }),
  ).toHaveCount(0);
  const first = await hero.getByRole("img").getAttribute("alt");
  await hero
    .getByRole("button", { name: "Siguiente imagen industrial" })
    .click();
  await expect(hero.getByRole("img")).not.toHaveAttribute("alt", first!);
});
