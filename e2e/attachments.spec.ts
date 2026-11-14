import AxeBuilder from "@axe-core/playwright";
import { actionSaved, resetDemo, seed } from "./seed";
import { expect, test, type Page } from "@playwright/test";

// T11: anexos (proposta A, lista com miniatura). Os testes que gravam devolvem as demandas ao estado inicial.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.tags.includes("@grava")) await resetDemo();
});

const title = "Revisar textos da página inicial";
const dialog = (page: Page) => page.getByRole("dialog", { name: title });
const pageUrl = () => `/demandas/${seed().demands.d1}`;
// A remoção some da tela na hora; quem recarrega espera a gravação terminar.
async function save(page: Page, act: () => Promise<void>) {
  const saved = actionSaved(page);
  await act();
  await saved;
}

// No servidor de desenvolvimento frio, o campo de arquivo aparece antes do React ligar o onChange.
async function openPage(page: Page) {
  await page.goto(pageUrl());
  await page.waitForLoadState("networkidle");
}

const item = (page: Page, name: string) =>
  page.locator(".attachment-list li").filter({ hasText: name });

// Uma imagem PNG de 1 pixel e um PDF mínimo, montados aqui para não depender de arquivo no repositório.
const png = (name: string) => ({
  name,
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64",
  ),
});
const pdf = (name: string) => ({
  name,
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"),
});

test(
  "in the window: attach an image and a PDF, see them on the page after a reload, open and remove them",
  { tag: "@grava" },
  async ({ page }) => {
    const stamp = Date.now();
    const image = `print-${stamp}.png`;
    const doc = `contrato-${stamp}.pdf`;
    await page.goto("/");
    await page.getByRole("button", { name: title }).click();
    // A janela chega em streaming pela rota interceptada; o campo de arquivo liga depois.
    await page.waitForLoadState("networkidle");
    await dialog(page).locator("summary", { hasText: "Anexos" }).click();
    await dialog(page)
      .getByLabel("Escolher arquivos")
      .setInputFiles([png(image), pdf(doc)]);
    await expect(item(page, image)).toBeVisible({ timeout: 15_000 });
    await expect(item(page, doc)).toBeVisible({ timeout: 15_000 });

    await page.goto(pageUrl());
    await expect(
      item(page, image).getByRole("img", { name: image }),
    ).toBeVisible();
    await expect(item(page, doc)).toContainText("PDF");
    await expect(item(page, doc)).toContainText("Você");

    // abre em outra aba, por um link assinado e temporário do Storage. Abre a imagem:
    // o Chromium sem janela do CI não tem leitor de PDF e baixa o PDF, sem mudar a aba.
    const popup = page.waitForEvent("popup");
    await item(page, image)
      .getByRole("button", { name: image, exact: true })
      .click();
    const tab = await popup;
    await expect(tab).toHaveURL(/\/storage\/v1\/object\/sign\/attachments\//);
    await tab.close();

    for (const name of [image, doc]) {
      await item(page, name)
        .getByRole("button", { name: `Remover ${name}` })
        .click();
      await save(page, () =>
        item(page, name)
          .getByRole("button", { name: "Remover", exact: true })
          .click(),
      );
      await expect(item(page, name)).toHaveCount(0);
    }
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Anexar arquivos" }),
    ).toBeVisible();
    await expect(item(page, image)).toHaveCount(0);
    await expect(item(page, doc)).toHaveCount(0);
  },
);

test("a refused file says why and is not sent", async ({ page }) => {
  await openPage(page);
  await page.getByLabel("Escolher arquivos").setInputFiles([
    {
      name: "virus.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("MZ"),
    },
  ]);
  await expect(
    page.getByRole("alert").filter({ hasText: "virus.exe" }),
  ).toHaveText("Tipo de arquivo não aceito: virus.exe.");
  await expect(item(page, "virus.exe")).toHaveCount(0);
});

for (const theme of ["light", "dark"] as const) {
  test(
    `axe with an attachment and the remove confirmation open, theme ${theme}`,
    { tag: "@grava" },
    async ({ page }) => {
      await page.addInitScript(
        (t) => localStorage.setItem("trilhajp3-theme", t),
        theme,
      );
      const name = `axe-${theme}-${Date.now()}.png`;
      await openPage(page);
      await page.getByLabel("Escolher arquivos").setInputFiles([png(name)]);
      await expect(item(page, name)).toBeVisible({ timeout: 15_000 });
      await item(page, name)
        .getByRole("button", { name: `Remover ${name}` })
        .click();
      await expect(page.getByText("Remover este anexo?")).toBeVisible();
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        violations
          .filter((v) => v.impact === "critical" || v.impact === "serious")
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`),
      ).toEqual([]);
      await save(page, () =>
        item(page, name)
          .getByRole("button", { name: "Remover", exact: true })
          .click(),
      );
      await expect(item(page, name)).toHaveCount(0);
    },
  );
}
