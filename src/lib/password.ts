// Senha: trocar logado e recuperar pelo e-mail (tasks/senha-spec.md). Validação na borda, sem rede.
import { z } from "zod";

// O Auth exige 12 (configurado em 2026-10-26); o bcrypt só lê os primeiros 72 bytes.
const MIN = 12;
const MAX = 72;

export type PasswordErrors = Partial<
  Record<"current" | "password" | "confirm", string>
>;

const text = (form: FormData, key: string) => String(form.get(key) ?? "");

export function parseNewPassword(
  form: FormData,
): { ok: true; password: string } | { ok: false; errors: PasswordErrors } {
  const password = text(form, "password");
  if (password.length < MIN)
    return {
      ok: false,
      errors: { password: `A senha precisa ter pelo menos ${MIN} caracteres.` },
    };
  if (new TextEncoder().encode(password).length > MAX)
    return {
      ok: false,
      errors: { password: `A senha pode ter no máximo ${MAX} caracteres.` },
    };
  if (text(form, "confirm") !== password)
    return { ok: false, errors: { confirm: "As 2 senhas não são iguais." } };
  return { ok: true, password };
}

// Na Conta: a atual vem junto e a nova não pode repetir a atual.
export function parseCurrentPassword(
  form: FormData,
):
  | { ok: true; current: string; password: string }
  | { ok: false; errors: PasswordErrors } {
  const current = text(form, "current");
  if (!current)
    return { ok: false, errors: { current: "Digite a senha atual." } };
  const next = parseNewPassword(form);
  if (!next.ok) return next;
  if (next.password === current)
    return {
      ok: false,
      errors: { password: "A senha nova precisa ser diferente da atual." },
    };
  return { ok: true, current, password: next.password };
}

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());

export function parseResetEmail(form: FormData) {
  const result = email.safeParse(form.get("email"));
  return result.success ? result.data : null;
}

// O método de entrada vem do token assinado (getClaims), não de cookie que o navegador possa forjar.
// O supabase-js tipa o amr como lista de textos ou de objetos { method }: aceita os 2.
export function isRecoverySession(
  claims:
    { amr?: (string | { method: string; timestamp?: number })[] } | undefined,
) {
  return (
    claims?.amr?.some(
      (a) => (typeof a === "string" ? a : a.method) === "recovery",
    ) ?? false
  );
}
