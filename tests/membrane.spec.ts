import { expect, test } from "@playwright/test";

test("unavailable WebGPU preserves the material and every layer control", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", { get: () => undefined });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const scene = page.locator("[data-renderer]");
  await expect(scene).toHaveAttribute("data-renderer", "svg");
  await expect(
    scene.getByRole("img", { name: "La membrana, capa por capa" }),
  ).toBeVisible();
  const controls = page.getByRole("group", {
    name: "Explorar las capas del material",
  });
  for (const name of ["Cubierta", "Matriz", "Soporte"]) {
    const button = controls.getByRole("button", { name: new RegExp(name) });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(scene.locator("g[data-selected=true]")).toHaveCount(1);
    await expect(page.locator(".hero-inspection [aria-live]")).toContainText(
      name,
    );
    expect(await controls.locator("button[aria-pressed=true]").count()).toBe(1);
  }
  await page
    .getByRole("button", { name: "Pausar animaciones", exact: true })
    .click();
  await expect(scene.locator("[data-motion]")).toHaveAttribute(
    "data-motion",
    "paused",
  );
  expect(errors).toEqual([]);
});

test("keyboard inspection responds immediately with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const button = page
    .getByRole("group", { name: "Explorar las capas del material" })
    .getByRole("button", { name: /Soporte/ });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-renderer]")).toHaveAttribute(
    "data-motion",
    "stopped",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
