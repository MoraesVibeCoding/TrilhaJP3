import { describe, expect, test } from "vitest";
import { LOGIN_PATH, redirectFor, safeNext } from "./auth-redirect";

describe("safeNext", () => {
  test("aceita caminho interno, com busca", () => {
    expect(safeNext("/demandas")).toBe("/demandas");
    expect(safeNext("/demandas/12?de=x")).toBe("/demandas/12?de=x");
  });

  test("troca por / o que sairia do app ou não é caminho", () => {
    for (const bad of [
      null,
      undefined,
      "",
      "demandas",
      "//evil.com",
      "/\\evil.com",
      "https://evil.com",
      "/%2F%2Fevil.com",
      "javascript:alert(1)",
      LOGIN_PATH,
      `${LOGIN_PATH}?de=/x`,
    ]) {
      expect(safeNext(bad)).toBe("/");
    }
  });
});

describe("redirectFor", () => {
  test("sem sessão, rota do app vai para a entrada lembrando a origem", () => {
    expect(redirectFor("/", "", false)).toBe(LOGIN_PATH);
    expect(redirectFor("/demandas", "?visao=quadro", false)).toBe(
      `${LOGIN_PATH}?de=%2Fdemandas%3Fvisao%3Dquadro`,
    );
  });

  test("sem sessão, a própria entrada não redireciona", () => {
    expect(redirectFor(LOGIN_PATH, "", false)).toBeNull();
  });

  test("com sessão, a entrada manda para o destino seguro", () => {
    expect(redirectFor(LOGIN_PATH, "", true)).toBe("/");
    expect(redirectFor(LOGIN_PATH, "?de=%2Fdemandas", true)).toBe("/demandas");
    expect(redirectFor(LOGIN_PATH, "?de=%2F%2Fevil.com", true)).toBe("/");
  });

  test("com sessão, rota do app segue", () => {
    expect(redirectFor("/demandas", "", true)).toBeNull();
  });
});
