import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

type CookieMethods = {
  getAll: () => { name: string; value: string }[];
  setAll: (
    cookies: { name: string; value: string; options: object }[],
    headers: Record<string, string>,
  ) => void;
};

const auth = vi.hoisted(() => ({
  claims: null as object | null,
  refresh: false,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: { cookies: CookieMethods },
  ) => ({
    auth: {
      getClaims: async () => {
        // Simula a renovação do token: a biblioteca grava o cookie novo e os cabeçalhos de cache.
        if (auth.refresh) {
          options.cookies.setAll(
            [
              {
                name: "sb-ref-auth-token",
                value: "novo",
                options: { path: "/" },
              },
            ],
            {
              "cache-control":
                "private, no-cache, no-store, must-revalidate, max-age=0",
              expires: "0",
              pragma: "no-cache",
            },
          );
        }
        return {
          data: auth.claims ? { claims: auth.claims } : null,
          error: null,
        };
      },
    },
  }),
}));

const { updateSession: proxy } = await import("./proxy");

const request = (path: string) =>
  new NextRequest(new URL(path, "http://localhost:3000"));

beforeEach(() => {
  auth.claims = null;
  auth.refresh = false;
});

describe("updateSession", () => {
  test("sem sessão, rota do app redireciona para /entrar com a origem", async () => {
    const res = await proxy(request("/demandas?visao=quadro"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/entrar?de=%2Fdemandas%3Fvisao%3Dquadro",
    );
  });

  test("sem sessão, /entrar abre", async () => {
    const res = await proxy(request("/entrar"));
    expect(res.headers.get("location")).toBeNull();
  });

  test("com sessão, rota do app segue", async () => {
    auth.claims = { sub: "u1" };
    const res = await proxy(request("/demandas"));
    expect(res.headers.get("location")).toBeNull();
  });

  test("com sessão, /entrar manda para o destino seguro", async () => {
    auth.claims = { sub: "u1" };
    const res = await proxy(request("/entrar?de=%2F%2Fevil.com"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });

  test("token renovado: o cookie novo e os cabeçalhos de cache vão na resposta", async () => {
    auth.claims = { sub: "u1" };
    auth.refresh = true;
    const res = await proxy(request("/"));
    expect(res.cookies.get("sb-ref-auth-token")?.value).toBe("novo");
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(res.headers.get("pragma")).toBe("no-cache");
  });

  test("token renovado e redirecionado: o redirecionamento leva o cookie e os cabeçalhos", async () => {
    auth.claims = { sub: "u1" };
    auth.refresh = true;
    const res = await proxy(request("/entrar"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
    expect(res.cookies.get("sb-ref-auth-token")?.value).toBe("novo");
    expect(res.headers.get("cache-control")).toContain("no-store");
  });
});
