import { expect, test } from "@playwright/test";

test("vector membrane keeps the latest selection during rapid interactions", async ({
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
    page.getByRole("img", { name: /Capas de la tela/ }).locator("image"),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .locator('[data-material-layer="1"]')
        .evaluate((node) => getComputedStyle(node).transform),
    )
    .toBe("matrix(1, 0, 0, 1, 0, -12)");
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
    page.getByRole("button", { name: "Pausar imágenes", exact: true }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("button", { name: /^Pausar/ })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("hero slideshow pauses and can be advanced explicitly", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Imágenes de la industria" });
  await hero.getByRole("button", { name: "Pausar imágenes" }).click();
  await expect(
    hero.getByRole("button", { name: "Reanudar imágenes" }),
  ).toBeVisible();
  const first = await hero.getByRole("img").getAttribute("alt");
  await hero
    .getByRole("button", { name: "Siguiente imagen industrial" })
    .click();
  await expect(hero.getByRole("img")).not.toHaveAttribute("alt", first!);
});
