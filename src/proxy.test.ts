import { NextRequest } from "next/server";
import { expect, test, vi } from "vitest";

const updateSession = vi.hoisted(() => vi.fn(async () => "resposta"));
vi.mock("@/lib/supabase/proxy", () => ({ updateSession }));

const { config, proxy } = await import("./proxy");

test("cada requisição passa pela renovação de sessão", async () => {
  const request = new NextRequest("http://localhost:3000/demandas");
  await expect(proxy(request)).resolves.toBe("resposta");
  expect(updateSession).toHaveBeenCalledWith(request);
});

test("manifest, ícones e arquivos do Next ficam fora do Proxy; páginas entram", () => {
  const matcher = new RegExp(`^${config.matcher[0]}$`);
  for (const path of [
    "/manifest.webmanifest",
    "/icons/icon-192.png",
    "/apple-icon.png",
    "/icon.svg",
    "/favicon.ico",
    "/_next/static/x.js",
  ]) {
    expect(matcher.test(path), path).toBe(false);
  }
  for (const path of ["/", "/demandas", "/demandas/d1", "/entrar"]) {
    expect(matcher.test(path), path).toBe(true);
  }
});
