import { expect, test, type Page } from "@playwright/test";

const title = "Revisar textos da página inicial";
const dialog = (page: Page) => page.getByRole("dialog", { name: title });

test.describe("endereço da janela", () => {
  test("opening from Retomar shows the demand address; Back closes, Forward reopens", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: title }).click();
    await expect(dialog(page)).toBeVisible();
    await expect(page).toHaveURL("/demandas/d1");

    await page.goBack();
    await expect(dialog(page)).toBeHidden();
    await expect(page).toHaveURL("/");

    await page.goForward();
    await expect(dialog(page)).toBeVisible();
  });

  test("closing with Esc restores the list address and focus", async ({
    page,
  }) => {
    await page.goto("/demandas");
    const row = page.getByRole("button", { name: title }).first();
    await row.click();
    await expect(page).toHaveURL("/demandas/d1");
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await expect(page).toHaveURL("/demandas");
    await expect(row).toBeFocused();
  });
});

test.describe("página inteira", () => {
  const box = async (page: Page, name: RegExp) =>
    (await page.getByRole("heading", { level: 2, name }).boundingBox())!;

  for (const [width, columns] of [
    [1440, 3],
    [820, 2],
    [320, 1],
  ] as const) {
    test(`${width}px shows ${columns} column(s) without horizontal scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/demandas/d1");
      await expect(
        page.getByRole("heading", { level: 1, name: title }),
      ).toBeVisible();
      const steps = await box(page, /^Subtarefas/);
      const now = await box(page, /^Agora$/);
      const files = await box(page, /^Anexos/);
      const sameRow = (a: { y: number }, b: { y: number }) =>
        Math.abs(a.y - b.y) < 8;
      expect(sameRow(steps, now)).toBe(columns > 1);
      expect(sameRow(now, files)).toBe(columns === 3);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("a step concluded in the window is still concluded on the page after a reload", async ({
    page,
  }) => {
    await page.goto("/demandas");
    await page.getByRole("button", { name: title }).first().click();
    await dialog(page).getByRole("button", { name: "Concluir passo" }).click();
    await page.reload();
    const agora = page.getByRole("region", { name: "Agora" });
    await expect(agora).toContainText("Rodapé");
    await expect(agora).toContainText("Passo 3 de 3");
  });

  test("Foco shows only Subtarefas and Agora", async ({ page }) => {
    await page.goto("/demandas/d1");
    // o atalho só vale depois da hidratação: repete até o modo trocar, como em home.spec.ts
    await expect(async () => {
      if ((await page.locator("html").getAttribute("data-mode")) !== "focus")
        await page.keyboard.press("f");
      await expect(page.locator("html")).toHaveAttribute("data-mode", "focus", {
        timeout: 500,
      });
    }).toPass();
    await expect(
      page.getByRole("heading", { name: /^Comentários/ }),
    ).toBeHidden();
    await expect(
      page.getByRole("heading", { name: /^Histórico/ }),
    ).toBeHidden();
    await expect(
      page.getByRole("heading", { name: /^Subtarefas/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Copiar link" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Tirar de Agora" }),
    ).toBeHidden();
  });
});

test.describe("atalhos da página inteira", () => {
  test("Abrir em página inteira goes from the window to the page", async ({
    page,
  }) => {
    await page.goto("/demandas");
    await page.getByRole("button", { name: title }).first().click();
    await dialog(page)
      .getByRole("link", { name: "Abrir em página inteira" })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page).toHaveURL("/demandas/d1");
    // a página substitui a janela no histórico: Voltar leva direto à lista
    await page.goBack();
    await expect(page).toHaveURL("/demandas");
    await expect(
      page.getByRole("heading", { level: 1, name: "Demandas" }),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("Copiar link puts the address on the clipboard", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/demandas/d1");
    await page.getByRole("button", { name: "Copiar link" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Link copiado." }),
    ).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      new URL("/demandas/d1", page.url()).href,
    );
  });

  test("an unknown demand says so", async ({ page }) => {
    await page.goto("/demandas/nao-existe");
    await expect(
      page.getByRole("heading", { level: 1, name: "Demanda não encontrada." }),
    ).toBeVisible();
  });
});
