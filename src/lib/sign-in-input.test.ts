import { expect, test } from "vitest";
import { parseSignIn } from "./sign-in-input";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};

test("aceita e-mail e senha, com o e-mail sem espaços nas pontas", () => {
  expect(
    parseSignIn(form({ email: "  pedro@exemplo.com.br ", password: "x" })),
  ).toEqual({ email: "pedro@exemplo.com.br", password: "x" });
});

test("recusa e-mail inválido, senha vazia, campo ausente e tamanho exagerado", () => {
  expect(parseSignIn(form({ email: "pedro", password: "x" }))).toBeNull();
  expect(
    parseSignIn(form({ email: "pedro@exemplo.com.br", password: "" })),
  ).toBeNull();
  expect(parseSignIn(form({ email: "pedro@exemplo.com.br" }))).toBeNull();
  expect(
    parseSignIn(
      form({ email: "pedro@exemplo.com.br", password: "x".repeat(201) }),
    ),
  ).toBeNull();
  expect(
    parseSignIn(form({ email: `${"a".repeat(250)}@x.com`, password: "x" })),
  ).toBeNull();
});
