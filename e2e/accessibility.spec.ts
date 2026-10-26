import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// CONSTRAINTS.md: zero violações críticas ou sérias, regras WCAG 2.0/2.1 A e AA.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function scan(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(TAGS)
    .analyze();
  return violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`,
    );
}

const themes = ["light", "dark"] as const;
const views = [
  ["Tabela", "table"],
  ["Por projeto", "projects"],
  ["Quadro", "board"],
] as const;

for (const theme of themes) {
  test.describe(`acessibilidade, tema ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        (t) => localStorage.setItem("trilhajp3-theme", t),
        theme,
      );
    });

    test("Retomar", async ({ page }) => {
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "Retomar" }),
      ).toBeVisible();
      expect(await scan(page)).toEqual([]);
    });

    for (const [label, layout] of views) {
      test(`Demandas, visão ${label}`, async ({ page }) => {
        await page.addInitScript(
          (l) =>
            localStorage.setItem(
              "trilhajp3-demandas",
              JSON.stringify({ layout: l }),
            ),
          layout,
        );
        await page.goto("/demandas");
        await expect(
          page.getByRole("heading", { name: "Demandas" }),
        ).toBeVisible();
        expect(await scan(page)).toEqual([]);
      });
    }

    test("demanda em página inteira", async ({ page }) => {
      await page.goto("/demandas/d1");
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: "Revisar textos da página inicial",
        }),
      ).toBeVisible();
      expect(await scan(page)).toEqual([]);
    });

    test("janela de captura aberta", async ({ page }) => {
      await page.goto("/demandas");
      await page.getByRole("button", { name: "Nova demanda" }).click();
      await expect(
        page.getByRole("dialog", { name: "Nova demanda" }),
      ).toBeVisible();
      expect(await scan(page)).toEqual([]);
    });

    test("janela da demanda aberta", async ({ page }) => {
      await page.goto("/");
      await page
        .getByRole("button", { name: "Revisar textos da página inicial" })
        .first()
        .click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(await scan(page)).toEqual([]);
    });
  });
}
