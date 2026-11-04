import AxeBuilder from "@axe-core/playwright";
import { actionSaved, resetDemo, seed } from "./seed";
import { expect, test, type Page } from "@playwright/test";

// T9: comentários (proposta B, campo no topo). Os testes que gravam devolvem as demandas ao estado inicial.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.tags.includes("@grava")) await resetDemo();
});

const title = "Revisar textos da página inicial";
const dialog = (page: Page) => page.getByRole("dialog", { name: title });
const pageUrl = () => `/demandas/${seed().demands.d1}`;
const field = (page: Page) =>
  page.getByRole("textbox", { name: "Novo comentário" });
const comment = (page: Page, text: string) =>
  page.locator(".comment-list li").filter({ hasText: text });

const openComments = (page: Page) =>
  dialog(page).locator("summary", { hasText: "Comentários" }).click();

async function save(page: Page, act: () => Promise<void>) {
  const saved = actionSaved(page);
  await act();
  await saved;
}

test(
  "in the window: Ctrl+Enter publishes, the comment stays after a reload, and only then can be deleted",
  { tag: "@grava" },
  async ({ page }) => {
    const text = `Combinado com o cliente ${Date.now()}`;
    await page.goto("/");
    await page.getByRole("button", { name: title }).click();
    await openComments(page);
    await field(page).fill(`${text}\nentrega sexta`);
    await save(page, () => field(page).press("Control+Enter"));
    await expect(comment(page, text)).toContainText("Você");
    await expect(field(page)).toHaveValue("");
    await expect(field(page)).toBeFocused();

    await page.goto(pageUrl());
    const item = comment(page, text);
    await expect(item.locator(".comment-body")).toHaveText(
      `${text}\nentrega sexta`,
    );

    await item.getByRole("button", { name: /^Apagar comentário/ }).click();
    await expect(item.getByText("Apagar este comentário?")).toBeVisible();
    await save(page, () =>
      item.getByRole("button", { name: "Apagar", exact: true }).click(),
    );
    await expect(comment(page, text)).toHaveCount(0);
    await page.reload();
    await expect(field(page)).toBeVisible();
    await expect(comment(page, text)).toHaveCount(0);
  },
);

test(
  "on the full page: HTML shows as text and only https becomes a link",
  { tag: "@grava" },
  async ({ page }) => {
    const mark = `xss ${Date.now()}`;
    let alerted = false;
    page.on("dialog", (d) => {
      alerted = true;
      return d.dismiss();
    });
    await page.goto(pageUrl());
    await field(page).fill(
      `${mark} <script>alert(1)</script> <img src=x onerror="alert(1)"> javascript:alert(1) https://exemplo.com.br/a`,
    );
    await save(page, () =>
      page.getByRole("button", { name: "Comentar" }).click(),
    );
    await page.reload();
    const item = comment(page, mark);
    await expect(item).toContainText("<script>alert(1)</script>");
    await expect(item.locator("script, img")).toHaveCount(0);
    const links = item.getByRole("link");
    await expect(links).toHaveCount(1);
    await expect(links).toHaveAttribute("href", "https://exemplo.com.br/a");
    await expect(links).toHaveAttribute("rel", "noopener noreferrer");
    expect(alerted).toBe(false);
  },
);

test(
  "Esc in the delete confirmation closes only the confirmation",
  { tag: "@grava" },
  async ({ page }) => {
    const text = `Esc ${Date.now()}`;
    await page.goto("/");
    await page.getByRole("button", { name: title }).click();
    await openComments(page);
    await field(page).fill(text);
    await save(page, () =>
      page.getByRole("button", { name: "Comentar" }).click(),
    );
    // Só depois de o servidor devolver o id o comentário ganha a lixeira.
    const trash = comment(page, text).getByRole("button", {
      name: /^Apagar comentário/,
    });
    await trash.click();
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeVisible();
    await expect(page.getByText("Apagar este comentário?")).toHaveCount(0);
    await expect(trash).toBeFocused();
  },
);

for (const theme of ["light", "dark"] as const) {
  test(
    `axe with a comment and the delete confirmation open, theme ${theme}`,
    { tag: "@grava" },
    async ({ page }) => {
      await page.addInitScript(
        (t) => localStorage.setItem("trilhajp3-theme", t),
        theme,
      );
      const text = `Axe ${theme} ${Date.now()}`;
      await page.goto(pageUrl());
      await field(page).fill(`${text} https://exemplo.com.br`);
      await save(page, () =>
        page.getByRole("button", { name: "Comentar" }).click(),
      );
      await page.reload();
      await comment(page, text)
        .getByRole("button", { name: /^Apagar comentário/ })
        .click();
      await expect(page.getByText("Apagar este comentário?")).toBeVisible();
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        violations
          .filter((v) => v.impact === "critical" || v.impact === "serious")
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`),
      ).toEqual([]);
    },
  );
}
