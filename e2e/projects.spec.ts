// T4: projetos reais contra o Supabase de teste, com a empresa do usuário fictício.
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const name = `Projeto E2E ${Date.now()}`;

test("sem login, /projetos leva para /entrar", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  await page.goto("/projetos");
  await expect(page).toHaveURL(/\/entrar\?de=%2Fprojetos/);
  await context.close();
});

test("cria um projeto; nome vazio mostra o erro do campo", async ({ page }) => {
  await page.goto("/projetos");
  await page.getByRole("button", { name: "Novo projeto" }).click();
  const form = page.getByRole("form", { name: "Novo projeto" });
  await form.getByLabel("Link").fill("http://sem-https.com");
  await form.getByLabel("Nome").fill("   ");
  await form.getByRole("button", { name: "Criar projeto" }).click();
  await expect(form.getByText("Dê um nome ao projeto.")).toBeVisible();
  await expect(
    form.getByText("Use um endereço que comece com https://."),
  ).toBeVisible();
  await expect(form.getByLabel("Link")).toHaveValue("http://sem-https.com");

  await form.getByLabel("Nome").fill(name);
  await form.getByLabel("Link").fill("https://exemplo.com.br/e2e");
  await form.getByLabel("Estado").selectOption("in_progress");
  await form.getByRole("button", { name: "Criar projeto" }).click();
  await expect(page.locator(".board-message")).toHaveText("Projeto salvo.");
  const group = page.locator("section", {
    has: page.getByRole("heading", { name: /Em andamento/ }),
  });
  await expect(group.getByText(name)).toBeVisible();
});

test("edita, arquiva e restaura", async ({ page }) => {
  await page.goto("/projetos");
  await page.getByRole("button", { name: `Editar ${name}` }).click();
  const form = page.getByRole("form", { name: `Editar ${name}` });
  await form.getByLabel("Prioridade").selectOption("high");
  await form.getByRole("button", { name: "Salvar" }).click();
  await expect(page.locator(".board-message")).toHaveText("Projeto salvo.");
  await expect(
    page.getByRole("button", { name: `Editar ${name}` }),
  ).toBeFocused();

  await page.getByRole("button", { name: `Editar ${name}` }).click();
  await page
    .getByRole("form", { name: `Editar ${name}` })
    .getByRole("button", { name: "Arquivar" })
    .click();
  await expect(page.locator(".board-message")).toHaveText(
    `“${name}” foi para Arquivados.`,
  );
  await expect(
    page.getByRole("button", { name: `Editar ${name}` }),
  ).toBeHidden();

  await page.getByRole("link", { name: /Arquivados/ }).click();
  await page.getByRole("button", { name: `Restaurar ${name}` }).click();
  await expect(page.locator(".board-message")).toHaveText(
    `“${name}” voltou para Ativos.`,
  );
  await page.getByRole("link", { name: /Ativos/ }).click();
  await expect(
    page.getByRole("button", { name: `Editar ${name}` }),
  ).toBeVisible();
});

test("no celular, o botão flutuante não cobre o último Editar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projetos");
  const last = page.getByRole("button", { name: /^Editar / }).last();
  await last.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const box = (await last.boundingBox())!;
  const hit = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.textContent,
    [box.x + box.width / 2, box.y + box.height / 2],
  );
  expect(hit).toBe("Editar");
});
