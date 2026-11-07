import AxeBuilder from "@axe-core/playwright";
import { actionSaved, resetDemo, seed } from "./seed";
import { expect, test, type Page } from "@playwright/test";

// T8: etiquetas (proposta B, painel de marcar). Os testes que gravam devolvem as demandas ao estado inicial.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.tags.includes("@grava")) await resetDemo();
});

const title = "Revisar textos da página inicial";
const dialog = (page: Page) => page.getByRole("dialog", { name: title });
const pageUrl = () => `/demandas/${seed().demands.d1}`;
const applied = (page: Page) =>
  page.getByRole("list", { name: "Etiquetas aplicadas" });
const panel = (page: Page) =>
  page.getByRole("group", { name: "Etiquetas da empresa" });

async function save(page: Page, act: () => Promise<void>) {
  const saved = actionSaved(page);
  await act();
  await saved;
}

async function create(page: Page, name: string) {
  await page.getByRole("button", { name: "Etiquetas", exact: true }).click();
  const field = page.getByRole("textbox", { name: "Buscar ou criar etiqueta" });
  await save(page, async () => {
    await field.fill(name);
    await field.press("Enter");
  });
}

test(
  "in the window: create a label, and it is still applied after a reload",
  { tag: "@grava" },
  async ({ page }) => {
    const name = `Urgente ${Date.now()}`;
    await page.goto("/");
    await page.getByRole("button", { name: title }).click();
    await create(page, name);
    await expect(applied(page).getByText(name)).toBeVisible();
    await expect(dialog(page)).toBeVisible();

    await page.goto(pageUrl());
    await expect(applied(page).getByText(name)).toBeVisible();
  },
);

test(
  "on the full page: change the color and take the label off, both saved",
  { tag: "@grava" },
  async ({ page }) => {
    const name = `Cor ${Date.now()}`;
    await page.goto(pageUrl());
    await create(page, name);
    const colors = panel(page).getByRole("group", { name: `Cor de ${name}` });
    await save(page, () =>
      colors.getByRole("button", { name: "Mostarda" }).click(),
    );
    await page.reload();
    await expect(applied(page).getByText(name)).toHaveAttribute(
      "data-color",
      "mostarda",
    );

    await page.getByRole("button", { name: "Etiquetas", exact: true }).click();
    await save(page, () =>
      panel(page).getByRole("checkbox", { name }).uncheck(),
    );
    await page.reload();
    // T10: o histórico mostra o nome ("Tirou a etiqueta …"); a etiqueta só não pode estar aplicada
    await expect(
      page.getByRole("button", { name: "Etiquetas", exact: true }),
    ).toBeVisible();
    await expect(applied(page).getByText(name)).toHaveCount(0);
  },
);

test(
  "the Etiqueta filter narrows every view and survives a reload",
  { tag: "@grava" },
  async ({ page }) => {
    const name = `Filtro ${Date.now()}`;
    await page.goto(pageUrl());
    await create(page, name);

    await page.goto("/demandas");
    await page.getByRole("combobox", { name: "Etiqueta" }).selectOption({
      label: name,
    });
    const rows = page
      .getByRole("table", { name: "Demandas" })
      .locator("tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(title);

    await page.reload();
    await expect(rows).toHaveCount(1);
    for (const view of ["Por projeto", "Quadro"]) {
      await page.getByRole("button", { name: view }).click();
      await expect(page.getByRole("button", { name: title })).toHaveCount(1);
      await expect(
        page.getByRole("button", { name: "Ajustar rodapé do site" }),
      ).toHaveCount(0);
    }
  },
);

test("Esc with the panel open closes only the panel", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: title }).click();
  const button = dialog(page).getByRole("button", {
    name: "Etiquetas",
    exact: true,
  });
  await button.click();
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeVisible();
  await expect(panel(page)).toHaveCount(0);
  await expect(button).toBeFocused();
});

for (const theme of ["light", "dark"] as const) {
  test(`axe with the label panel open, theme ${theme}`, async ({ page }) => {
    await page.addInitScript(
      (t) => localStorage.setItem("trilhajp3-theme", t),
      theme,
    );
    await page.goto(pageUrl());
    await page.getByRole("button", { name: "Etiquetas", exact: true }).click();
    await expect(panel(page)).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      violations
        .filter((v) => v.impact === "critical" || v.impact === "serious")
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`),
    ).toEqual([]);
  });
}

test(
  "the open panel fits inside the window, with no sideways scroll",
  { tag: "@grava" },
  async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pageUrl());
    // Estas três empurram o botão para perto da borda direita da janela, sem quebrar a linha
    // (o caso que a revisão pegou). Nome repetido reaproveita a etiqueta, então dá para rodar de novo.
    for (const name of ["Bug", "Cliente aguardando", "Financeiro"]) {
      await create(page, name);
      await page.keyboard.press("Escape");
    }
    await page.goto("/");
    await page.getByRole("button", { name: title }).click();
    await dialog(page)
      .getByRole("button", { name: "Etiquetas", exact: true })
      .click();
    const [win, box] = await Promise.all([
      dialog(page).boundingBox(),
      page.locator(".label-panel").boundingBox(),
    ]);
    expect(box!.x + box!.width).toBeLessThanOrEqual(win!.x + win!.width);
    const scrolled = await dialog(page).evaluate((d) => d.scrollLeft);
    expect(scrolled).toBe(0);
  },
);

test(
  "on a phone the panel keeps a 40-character name inside it",
  { tag: "@grava" },
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pageUrl());
    await create(page, "Aguardando aprovação do cliente no prazo");
    const overflow = await page
      .locator(".label-panel")
      .evaluate((p) => p.scrollWidth - p.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  },
);

test(
  "the pressed color shows the focus ring when reached by keyboard",
  { tag: "@grava" },
  async ({ page }) => {
    await page.goto(pageUrl());
    const name = `Foco ${Date.now()}`;
    await create(page, name);
    const pressed = panel(page)
      .getByRole("group", { name: `Cor de ${name}` })
      .getByRole("button", { name: "Névoa" });
    await expect(pressed).toBeEnabled();
    await pressed.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    const outline = await pressed.evaluate((b) => {
      const s = getComputedStyle(b);
      return [s.outlineWidth, s.outlineColor];
    });
    // Sinal escuro, no tema claro
    expect(outline).toEqual(["3px", "rgb(184, 51, 0)"]);
  },
);
