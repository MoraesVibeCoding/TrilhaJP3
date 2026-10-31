import AxeBuilder from "@axe-core/playwright";
import { actionSaved, resetDemo, seed } from "./seed";
import { expect, test, type Page } from "@playwright/test";

// T7: passos editáveis (proposta C). Os testes que gravam devolvem as demandas ao estado inicial no fim.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.tags.includes("@grava")) await resetDemo();
});

const title = "Revisar textos da página inicial";
const dialog = (page: Page) => page.getByRole("dialog", { name: title });
const pageUrl = () => `/demandas/${seed().demands.d1}`;
const steps = (page: Page) =>
  page.getByRole("list", { name: "Subtarefas" }).getByRole("listitem");

async function save(page: Page, act: () => Promise<void>) {
  const saved = actionSaved(page);
  await act();
  await saved;
}

test(
  "in the window: add a step, and it is still there after a reload",
  { tag: "@grava" },
  async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: title }).click();
    await dialog(page)
      .getByRole("button", { name: "Adicionar subtarefa" })
      .click();
    const field = dialog(page).getByRole("textbox", { name: "Nova subtarefa" });
    await save(page, async () => {
      await field.fill("Revisar o rodapé no celular");
      await field.press("Enter");
    });
    await expect(field).toHaveValue("");
    await expect(
      dialog(page).getByText("Revisar o rodapé no celular"),
    ).toBeVisible();

    await page.goto(pageUrl());
    await expect(steps(page).last()).toContainText(
      "Revisar o rodapé no celular",
    );
  },
);

test(
  "on the full page: rename, mark, unmark and remove a step, all saved",
  { tag: "@grava" },
  async ({ page }) => {
    await page.goto(pageUrl());
    const more = (name: string) =>
      page.getByRole("button", { name: `Mais opções para ${name}` });

    await more("Rodapé").click();
    await page.getByRole("button", { name: "Renomear" }).click();
    const field = page.getByRole("textbox", { name: "Novo título de Rodapé" });
    await save(page, async () => {
      await field.fill("Rodapé e redes");
      await field.press("Enter");
    });
    // O Enter salva e devolve o foco a "Mais opções", sem reabrir o campo.
    await expect(field).toBeHidden();
    await expect(more("Rodapé e redes")).toBeFocused();

    const box = page.getByRole("checkbox", {
      name: "Marcar Rodapé e redes como feita",
    });
    await save(page, () => box.check());
    await save(page, () =>
      page
        .getByRole("checkbox", { name: "Marcar Rodapé e redes como não feita" })
        .uncheck(),
    );

    await page.reload();
    await expect(steps(page).getByText("Rodapé e redes")).toBeVisible();
    await expect(
      page.getByRole("checkbox", { name: "Marcar Rodapé e redes como feita" }),
    ).not.toBeChecked();

    await more("Rodapé e redes").click();
    await save(page, () =>
      page.getByRole("button", { name: "Remover" }).click(),
    );
    await page.reload();
    await expect(steps(page).getByText("Rodapé e redes")).toHaveCount(0);
  },
);

test(
  "marking the current step done moves Agora to the next one",
  { tag: "@grava" },
  async ({ page }) => {
    await page.goto(pageUrl());
    const now = page.locator(".demand-page-now");
    await expect(now.locator(".detail-now-step")).toHaveText("Contato");
    await save(page, () =>
      page.getByRole("checkbox", { name: "Marcar Contato como feita" }).check(),
    );
    await expect(now.locator(".detail-now-step")).toHaveText("Rodapé");
    await page.reload();
    await expect(now.locator(".detail-now-step")).toHaveText("Rodapé");
  },
);

test("an empty title is not saved and says why", async ({ page }) => {
  await page.goto(pageUrl());
  await page.getByRole("button", { name: "Adicionar subtarefa" }).click();
  await page.getByRole("textbox", { name: "Nova subtarefa" }).press("Enter");
  await expect(
    page.getByRole("alert").filter({ hasText: "Escreva" }),
  ).toHaveText("Escreva o título da subtarefa.");
});

for (const theme of ["light", "dark"] as const) {
  test(`axe with the step options open, theme ${theme}`, async ({ page }) => {
    await page.addInitScript(
      (t) => localStorage.setItem("trilhajp3-theme", t),
      theme,
    );
    await page.goto(pageUrl());
    await page
      .getByRole("button", { name: "Mais opções para Contato" })
      .click();
    await page.getByRole("button", { name: "Adicionar subtarefa" }).click();
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      violations
        .filter((v) => v.impact === "critical" || v.impact === "serious")
        .map((v) => v.id),
    ).toEqual([]);
  });
}

test("group titles keep the space before the count", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: title }).click();
  const gaps = await dialog(page)
    .locator("summary")
    .evaluateAll((all) =>
      all.map((summary) => {
        const text = [...summary.childNodes].find(
          (n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim(),
        )!;
        const range = document.createRange();
        // até a última letra: o espaço em si é o que se mede
        range.setStart(text, 0);
        range.setEnd(text, text.textContent!.trimEnd().length);
        const count = summary.querySelector(".count")!;
        return (
          count.getBoundingClientRect().left -
          range.getBoundingClientRect().right
        );
      }),
    );
  expect(gaps).toHaveLength(4);
  for (const gap of gaps) expect(gap).toBeGreaterThan(2);
});
