// T3: login e sessão (tasks/t3-spec.md, item 5.3), contra o Supabase de teste.
import { seed } from "./seed";
import { expect, test } from "@playwright/test";

const email = () => process.env.E2E_EMAIL!;
const password = () => process.env.E2E_PASSWORD!;

test.describe("sem login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const path of ["/", "/demandas", `/demandas/${seed().demands.d1}`]) {
    test(`${path} leva para /entrar`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/entrar/);
      await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
    });
  }

  test("manifest e ícones abrem sem login (o PWA precisa deles)", async ({
    request,
  }) => {
    for (const path of [
      "/manifest.webmanifest",
      "/icons/icon-192.png",
      "/apple-icon.png",
      "/icon.svg",
    ]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(200);
    }
  });

  test("login certo volta para a página pedida", async ({ page }) => {
    await page.goto("/demandas");
    await page.getByLabel("E-mail").fill(email());
    await page.getByLabel("Senha").fill(password());
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/demandas");
  });

  test("senha errada mostra o erro genérico e não entra", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill(email());
    await page.getByLabel("Senha").fill("senha-errada-123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.locator("#login-error")).toHaveText(
      "E-mail ou senha incorretos. Confira e tente de novo.",
    );
    await expect(page).toHaveURL(/\/entrar/);
  });

  test("destino externo no ?de= é ignorado", async ({ page }) => {
    await page.goto("/entrar?de=%2F%2Fevil.com");
    await page.getByLabel("E-mail").fill(email());
    await page.getByLabel("Senha").fill(password());
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("com login", () => {
  test("/entrar manda de volta para o Retomar", async ({ page }) => {
    await page.goto("/entrar");
    await expect(page).toHaveURL("/");
  });

  test("Sair leva para /entrar e voltar não mostra a página protegida", async ({
    browser,
  }) => {
    // Sessão própria: sair revoga o token, e os outros testes usam a sessão guardada.
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill(email());
    await page.getByLabel("Senha").fill(password());
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/");

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/entrar/);
    await page.goBack();
    await page.reload();
    await expect(page).toHaveURL(/\/entrar/);
    await context.close();
  });
});
