import { expect, test } from "vitest";
import { securityHeaders } from "./security-headers";

const SUPABASE = "https://abc.supabase.co";
const header = (key: string, dev = false) =>
  securityHeaders({ supabaseUrl: SUPABASE, dev }).find((h) => h.key === key)
    ?.value;
const directives = (dev = false) =>
  Object.fromEntries(
    header("Content-Security-Policy", dev)!
      .split(";")
      .map((d) => d.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...sources]) => [name, sources]),
  );

test("CSP sem nonce: só o próprio app e o Supabase, nada de plugin, iframe ou formulário de fora", () => {
  expect(directives()).toEqual({
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "blob:", "data:", SUPABASE],
    "connect-src": ["'self'", SUPABASE],
    "font-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
  });
});

test("'unsafe-eval' só em desenvolvimento, como o guia do Next pede", () => {
  expect(directives(true)["script-src"]).toEqual([
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
  ]);
});

test("usa só a origem do Supabase, sem caminho", () => {
  const csp = securityHeaders({
    supabaseUrl: "https://abc.supabase.co/rest/v1/",
    dev: false,
  }).find((h) => h.key === "Content-Security-Policy")!.value;
  expect(csp).toContain("connect-src 'self' https://abc.supabase.co;");
});

test("os outros cabeçalhos de segurança", () => {
  expect(header("Strict-Transport-Security")).toBe(
    "max-age=63072000; includeSubDomains",
  );
  expect(header("X-Content-Type-Options")).toBe("nosniff");
  expect(header("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  expect(header("Permissions-Policy")).toBe(
    "camera=(), microphone=(), geolocation=()",
  );
});

test("sem a URL do Supabase, falha com uma mensagem clara", () => {
  expect(() => securityHeaders({ supabaseUrl: undefined, dev: false })).toThrow(
    "NEXT_PUBLIC_SUPABASE_URL não definida: a CSP precisa do host do Supabase.",
  );
  expect(() =>
    securityHeaders({ supabaseUrl: "nao-e-url", dev: false }),
  ).toThrow(
    "NEXT_PUBLIC_SUPABASE_URL não definida: a CSP precisa do host do Supabase.",
  );
});
