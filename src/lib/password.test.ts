import { expect, test } from "vitest";
import {
  isRecoverySession,
  parseCurrentPassword,
  parseNewPassword,
  parseResetEmail,
} from "./password";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};
const strong = "uma-senha-bem-longa";

test("senha nova: 12 caracteres no mínimo e igual nas 2 caixas", () => {
  expect(parseNewPassword(form({ password: strong, confirm: strong }))).toEqual(
    { ok: true, password: strong },
  );
  expect(
    parseNewPassword(form({ password: "curta", confirm: "curta" })),
  ).toEqual({
    ok: false,
    errors: { password: "A senha precisa ter pelo menos 12 caracteres." },
  });
  expect(
    parseNewPassword(form({ password: strong, confirm: `${strong}x` })),
  ).toEqual({
    ok: false,
    errors: { confirm: "As 2 senhas não são iguais." },
  });
  expect(parseNewPassword(form({}))).toEqual({
    ok: false,
    errors: { password: "A senha precisa ter pelo menos 12 caracteres." },
  });
});

test("senha nova acima de 72 caracteres é recusada: o bcrypt ignora o resto", () => {
  const long = "a".repeat(73);
  expect(parseNewPassword(form({ password: long, confirm: long }))).toEqual({
    ok: false,
    errors: { password: "A senha pode ter no máximo 72 caracteres." },
  });
});

test("na Conta, a senha nova precisa ser diferente da atual", () => {
  expect(
    parseCurrentPassword(
      form({ current: strong, password: strong, confirm: strong }),
    ),
  ).toEqual({
    ok: false,
    errors: { password: "A senha nova precisa ser diferente da atual." },
  });
  expect(
    parseCurrentPassword(
      form({ current: "", password: strong, confirm: strong }),
    ),
  ).toEqual({ ok: false, errors: { current: "Digite a senha atual." } });
  expect(
    parseCurrentPassword(
      form({ current: "a-atual-qualquer", password: strong, confirm: strong }),
    ),
  ).toEqual({ ok: true, current: "a-atual-qualquer", password: strong });
});

test("o e-mail do esqueci é conferido e normalizado", () => {
  expect(parseResetEmail(form({ email: "  Pedro@Exemplo.com.br " }))).toBe(
    "pedro@exemplo.com.br",
  );
  expect(parseResetEmail(form({ email: "nao-e-email" }))).toBeNull();
  expect(parseResetEmail(form({}))).toBeNull();
});

test("sessão de recuperação: só a que veio do link do e-mail (amr do token assinado)", () => {
  expect(
    isRecoverySession({ amr: [{ method: "recovery", timestamp: 1 }] }),
  ).toBe(true);
  expect(
    isRecoverySession({ amr: [{ method: "password", timestamp: 1 }] }),
  ).toBe(false);
  expect(isRecoverySession({ amr: ["recovery"] })).toBe(true);
  expect(isRecoverySession({ amr: ["password"] })).toBe(false);
  expect(isRecoverySession({})).toBe(false);
  expect(isRecoverySession(undefined)).toBe(false);
});
