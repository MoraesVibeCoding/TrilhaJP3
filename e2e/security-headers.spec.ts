import { actionSaved, resetDemo, seed } from "./seed";
import { expect, test, type Page } from "@playwright/test";

// T13: cabeçalhos de segurança e CSP sem nonce (tasks/t13-spec.md, seção 6, item 3).
test.afterEach(async ({}, testInfo) => {
  if (testInfo.tags.includes("@grava")) await resetDemo();
});

// Junta toda violação de CSP da aba, em qualquer navegação: o evento do navegador e o aviso no console.
async function watchCsp(page: Page) {
  const violations: string[] = [];
  await page.exposeFunction("__cspViolation", (v: string) =>
    violations.push(v),
  );
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) =>
      (
        window as unknown as { __cspViolation: (v: string) => void }
      ).__cspViolation(`${e.violatedDirective} ${e.blockedURI}`),
    );
  });
  page.on("console", (m) => {
    if (m.text().includes("Content Security Policy")) violations.push(m.text());
  });
  return violations;
}

const title = "Revisar textos da página inicial";
const png = (name: string) => ({
  name,
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64",
  ),
});

test("every response carries the security headers", async ({ request }) => {
  const res = await request.get("/entrar");
  const headers = res.headers();
  expect(headers["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  expect(headers["strict-transport-security"]).toBe(
    "max-age=63072000; includeSubDomains",
  );
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toBe(
    "camera=(), microphone=(), geolocation=()",
  );
});

test.describe("sem login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the sign-in screen raises no CSP violation", async ({ page }) => {
    const violations = await watchCsp(page);
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill("ninguem@example.test");
    await page.getByLabel("Senha").fill("senha-errada-123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.locator("#login-error")).not.toBeEmpty();
    expect(violations).toEqual([]);
  });
});

test(
  "the main screens, the window, the page and an attachment raise no CSP violation",
  { tag: "@grava" },
  async ({ page }) => {
    const violations = await watchCsp(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Retomar" })).toBeVisible();

    await page.goto("/demandas");
    for (const view of ["Tabela", "Por projeto", "Quadro"]) {
      await page.getByRole("button", { name: view }).click();
      await expect(page.getByRole("button", { name: view })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }

    await page.goto("/");
    await page.getByRole("button", { name: title }).click();
    await expect(page.getByRole("dialog", { name: title })).toBeVisible();

    // página inteira: envia uma imagem (Storage pelo navegador), vê a miniatura, abre e remove
    const name = `csp-${Date.now()}.png`;
    await page.goto(`/demandas/${seed().demands.d1}`);
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Escolher arquivos").setInputFiles([png(name)]);
    const item = page.locator(".attachment-list li").filter({ hasText: name });
    await expect(item.getByRole("img", { name })).toBeVisible({
      timeout: 15_000,
    });
    const popup = page.waitForEvent("popup");
    await item.getByRole("button", { name, exact: true }).click();
    await (await popup).close();
    await item.getByRole("button", { name: `Remover ${name}` }).click();
    const saved = actionSaved(page);
    await item.getByRole("button", { name: "Remover", exact: true }).click();
    await saved;

    await page.goto("/projetos");
    await expect(
      page.getByRole("heading", { level: 1, name: "Projetos" }),
    ).toBeVisible();
    expect(violations).toEqual([]);
  },
);
