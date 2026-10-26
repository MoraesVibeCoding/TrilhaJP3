import { expect, test, type Page } from "@playwright/test";

const dialog = (page: Page) =>
  page.getByRole("dialog", { name: "Nova demanda" });
const field = (page: Page) =>
  dialog(page).getByRole("textbox", { name: "Título da demanda" });

// a hidratação pode atrasar o ouvinte de teclado: repete até a janela abrir
async function openWithC(page: Page) {
  await expect(async () => {
    await page.keyboard.press("c");
    await expect(dialog(page)).toBeVisible({ timeout: 500 });
  }).toPass();
}

test("C opens the window, Enter creates the demand and it shows in the Tabela after reload", async ({
  page,
}) => {
  await page.goto("/demandas");
  const aFazer = page.getByRole("button", { name: /A fazer/ });
  const before = Number((await aFazer.innerText()).trim().split(/\s/)[0]);
  await openWithC(page);
  await expect(field(page)).toBeFocused();
  await field(page).fill("Ajustar menu do celular");
  await field(page).press("Enter");
  await expect(dialog(page)).toBeHidden();
  await expect(
    page.getByRole("status").filter({ hasText: "Demanda criada" }),
  ).toContainText("Ajustar menu do celular");
  await expect(aFazer).toContainText(String(before + 1));
  await page.reload();
  await expect(
    page
      .getByRole("table")
      .getByRole("button", { name: "Ajustar menu do celular" }),
  ).toBeVisible();
});

test("a similar title warns before creating", async ({ page }) => {
  await page.goto("/demandas");
  await openWithC(page);
  await field(page).fill("fotos da equipe");
  await field(page).press("Enter");
  await expect(dialog(page).getByText("Parecida com:")).toBeVisible();
  await expect(
    dialog(page).getByRole("button", { name: "Criar mesmo assim" }),
  ).toBeVisible();
  await dialog(page).getByRole("button", { name: "Criar mesmo assim" }).click();
  await expect(dialog(page)).toBeHidden();
});

test("Esc cancels without creating anything", async ({ page }) => {
  await page.goto("/demandas");
  await openWithC(page);
  await field(page).fill("Descartar isto");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  await expect(page.getByText("Descartar isto")).toHaveCount(0);
});

for (const width of [320, 390]) {
  test(`on a ${width}px phone the button is a 44px floating target and nothing overflows`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/demandas");
    const button = page.getByRole("button", { name: "Nova demanda" });
    await expect(button).toBeVisible();
    const box = (await button.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.y + box.height).toBeLessThanOrEqual(800);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await button.click();
    await expect(dialog(page)).toBeVisible();
    await expect(field(page)).toBeFocused();
  });
}

test("the button shows in Foco mode too", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("trilhajp3-mode", "focus"),
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demandas");
  await expect(
    page.getByRole("button", { name: "Nova demanda" }),
  ).toBeVisible();
});

for (const width of [320, 390]) {
  test(`on a ${width}px phone the state badges never break onto two lines`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/demandas");
    await expect(page.locator(".demand-card").first()).toBeVisible();
    const heights = await page
      .locator(".demand-card .badge")
      .evaluateAll((els) =>
        els.map((e) => Math.round(e.getBoundingClientRect().height)),
      );
    expect(heights.length).toBeGreaterThan(0);
    expect(Math.max(...heights)).toBeLessThanOrEqual(30);
  });
}

test("the floating button leaves room: the last card can scroll clear of it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/demandas");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const last = (await page.locator(".demand-card").last().boundingBox())!;
  const button = (await page
    .getByRole("button", { name: "Nova demanda" })
    .boundingBox())!;
  expect(last.y + last.height).toBeLessThan(button.y);
});

test("a captured demand opens as a full page from its own address", async ({
  page,
}) => {
  await page.goto("/demandas");
  await openWithC(page);
  await field(page).fill("Revisar contrato de hospedagem");
  await field(page).press("Enter");
  await expect(dialog(page)).toBeHidden();
  await page
    .getByRole("table")
    .getByRole("button", { name: "Revisar contrato de hospedagem" })
    .click();
  const address = new URL(page.url()).pathname;
  expect(address).toMatch(/^\/demandas\/[^/]+$/);
  await page.goto(address);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Revisar contrato de hospedagem",
    }),
  ).toBeVisible();
});
