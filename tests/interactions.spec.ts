import { expect, test } from "@playwright/test";

test("product carousel wraps in both directions and remains usable", async ({
  page,
}) => {
  await page.goto("/");
  const products = page.getByRole("region", { name: "Modelos de prensas" });
  const bucher = products.getByRole("button", {
    name: "Ver modelo 3: Prensa Bucher XPert",
    exact: true,
  });
  await bucher.click();
  await expect(bucher).toHaveAttribute("aria-current", "true");
  await expect(products.locator(".carousel-caption")).toHaveText(
    "Prensa Bucher XPert",
  );
  await products
    .getByRole("button", {
      name: "Ver modelo 1: Prensa Della Toffola",
      exact: true,
    })
    .click();
  await products.focus();
  const activeImage = products.locator(
    '.carousel-slide[aria-hidden="false"] img',
  );
  await page.keyboard.press("ArrowLeft");
  await expect(activeImage).toHaveAttribute("src", /Della-Toffola\.png/);
  // Allow the visible slide transition and the seamless loop reset to finish.
  await page.waitForTimeout(650);
  await page.keyboard.press("ArrowRight");
  await expect(activeImage).toHaveAttribute("src", /Della-Toffola_2\.png/);
  await page.waitForTimeout(650);
  await page.keyboard.press("ArrowRight");
  await expect(
    products.getByRole("img", {
      name: "Prensa Diemme Velvet T26",
      exact: true,
    }),
  ).toBeVisible();
});

test("products can be browsed with the keyboard when reduced motion is enabled", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const products = page.getByRole("region", { name: "Modelos de prensas" });
  await products.scrollIntoViewIfNeeded();
  await products.focus();
  await expect(products).toBeFocused();
  await expect(
    products.getByRole("img", { name: "Prensa Della Toffola", exact: true }),
  ).toHaveCount(1);
  await page.keyboard.press("ArrowRight");
  await expect(
    products.getByRole("img", {
      name: "Prensa Diemme Velvet T26",
      exact: true,
    }),
  ).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(
    products.getByRole("img", {
      name: "Prensa Diemme Velvet T26",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    products.getByRole("img", { name: "Prensa Della Toffola", exact: true }),
  ).toHaveCount(1);
});

test("swiping products advances the image on a mobile viewport", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "Touch interaction uses the mobile layout.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const products = page.getByRole("region", { name: "Modelos de prensas" });
  await products.scrollIntoViewIfNeeded();
  const bounds = await products.boundingBox();
  expect(bounds).not.toBeNull();
  const y = bounds!.y + bounds!.height / 2;
  const start = bounds!.x + bounds!.width * 0.8;
  const end = bounds!.x + bounds!.width * 0.2;
  const touch = await page.context().newCDPSession(page);
  await touch.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 1,
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: start, y }],
  });
  for (let step = 1; step <= 5; step++) {
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: start + ((end - start) * step) / 5, y }],
    });
  }
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await touch.detach();
  await expect(
    products.getByRole("img", {
      name: "Prensa Diemme Velvet T26",
      exact: true,
    }),
  ).toBeVisible();
});

test("Escape closes the mobile menu and returns keyboard focus to its button", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.locator(".menu-toggle");
  test.skip(
    !(await toggle.isVisible()),
    "Desktop navigation has no menu toggle.",
  );
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const faq = page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link", { name: "FAQ", exact: true });
  await faq.focus();
  await expect(faq).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test("contact handles an HTML gateway error with a clear message and preserves the retry", async ({
  page,
}) => {
  await page.goto("/#contacto");
  await page.locator("#contact-name").fill("Prueba de respuesta HTML");
  await page.locator("#contact-email").fill("prueba@example.com");
  await page
    .locator("#contact-message")
    .fill("Consulta de prueba sin correo externo.");
  const ids: string[] = [];
  await page.route("**/api/contact", async (route) => {
    ids.push(route.request().postDataJSON().submissionId);
    if (ids.length === 1) {
      await route.fulfill({
        status: 502,
        contentType: "text/html",
        body: "<html><body>Bad Gateway</body></html>",
      });
    } else {
      await route.fulfill({
        status: 201,
        json: { message: "¡Gracias! Recibimos tu mensaje." },
      });
    }
  });
  const send = page.getByRole("button", {
    name: "Enviar mensaje",
    exact: true,
  });
  await send.click();
  await expect(page.getByRole("status")).toHaveText(
    "No pudimos confirmar tu mensaje. Intentá nuevamente en unos minutos.",
  );
  await expect(page.locator("#contact-name")).toHaveValue(
    "Prueba de respuesta HTML",
  );
  await expect(page.locator("#contact-message")).toHaveValue(
    "Consulta de prueba sin correo externo.",
  );
  await send.click();
  await expect(page.getByRole("status")).toHaveText(
    "¡Gracias! Recibimos tu mensaje.",
  );
  await expect(page.locator("#contact-name")).toHaveValue("");
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
});

test("the contact form posts without placing personal data in the URL when JavaScript is disabled", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  try {
    const page = await context.newPage();
    await page.goto("/#contacto");
    expect(
      await page
        .locator(".contact-form noscript")
        .evaluate((element) => element.textContent),
    ).toBe("Activá JavaScript para enviar este formulario.");
    await page.locator("#contact-name").fill("Prueba sin JavaScript");
    await page.locator("#contact-email").fill("prueba@example.com");
    await page.locator("#contact-message").fill("Consulta sin JavaScript.");
    const [result] = await Promise.all([
      page.waitForResponse((response) =>
        response.url().endsWith("/api/contact"),
      ),
      page
        .locator(".contact-form")
        .evaluate((element: HTMLFormElement) => element.submit()),
    ]);
    expect(result.request().method()).toBe("POST");
    expect(new URL(result.request().url()).search).toBe("");
    expect(result.status()).toBe(415);
  } finally {
    await context.close();
  }
});
