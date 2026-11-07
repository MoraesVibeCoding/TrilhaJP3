import AxeBuilder from "@axe-core/playwright";
import { actionSaved, resetDemo, seed } from "./seed";
import { expect, test, type Page } from "@playwright/test";

// T10: histórico (proposta A, agrupado por dia). Os testes que gravam devolvem as demandas ao estado inicial.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.tags.includes("@grava")) await resetDemo();
});

const title = "Revisar textos da página inicial";
const dialog = (page: Page) => page.getByRole("dialog", { name: title });
const pageUrl = () => `/demandas/${seed().demands.d1}`;
const history = (page: Page) => page.locator(".history");

async function save(page: Page, act: () => Promise<void>) {
  const saved = actionSaved(page);
  await act();
  await saved;
}

test(
  "what changes in the window shows in the history of the window and of the page",
  { tag: "@grava" },
  async ({ page }) => {
    const label = `Histórico ${Date.now()}`;
    await page.goto("/");
    await page.getByRole("button", { name: title }).click();
    await save(page, () =>
      dialog(page).getByRole("button", { name: "Concluir passo" }).click(),
    );
    await dialog(page)
      .getByRole("button", { name: "Etiquetas", exact: true })
      .click();
    const field = page.getByRole("textbox", {
      name: "Buscar ou criar etiqueta",
    });
    await save(page, async () => {
      await field.fill(label);
      await field.press("Enter");
    });

    // recarregar com a janela aberta mostra a página inteira (T5b): volta à lista e reabre a janela
    await page.goto("/");
    await page.getByRole("button", { name: title }).click();
    await dialog(page).locator("summary", { hasText: "Histórico" }).click();
    const inWindow = dialog(page).locator(".history");
    await expect(inWindow.getByRole("heading", { name: "hoje" })).toBeVisible();
    // do mais novo ao mais antigo: a etiqueta veio depois do passo
    const items = inWindow.getByRole("listitem");
    await expect(items.nth(0)).toContainText(`Aplicou a etiqueta ${label}`);
    await expect(items.nth(0)).toContainText("Você");
    await expect(items.nth(1)).toContainText("Concluiu a subtarefa Contato");

    await page.goto(pageUrl());
    await expect(history(page).getByRole("listitem").nth(0)).toContainText(
      `Aplicou a etiqueta ${label}`,
    );
  },
);

for (const theme of ["light", "dark"] as const) {
  test(`axe with the history on the full page, theme ${theme}`, async ({
    page,
  }) => {
    await page.addInitScript(
      (t) => localStorage.setItem("trilhajp3-theme", t),
      theme,
    );
    await page.goto(pageUrl());
    // a carga da demonstração já gera eventos ("Sistema"): a lista nunca vem vazia
    await expect(history(page).getByRole("listitem").first()).toBeVisible();
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
