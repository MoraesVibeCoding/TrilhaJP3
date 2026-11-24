"use server";

import { parseResetEmail } from "@/lib/password";
import { createClient } from "@/lib/supabase/server";

export type ResetState =
  | { sent: true; message: string }
  | { sent: false; message: string; email: string }
  | undefined;

// A mesma resposta para qualquer e-mail válido: não revela quem tem conta.
const SENT =
  "Se o e-mail estiver cadastrado, enviamos um link para criar uma senha nova. Ele vale por 1 hora.";

export async function requestPasswordReset(
  _previous: ResetState,
  form: FormData,
): Promise<ResetState> {
  const email = parseResetEmail(form);
  if (!email)
    return {
      sent: false,
      message: "Digite um e-mail válido.",
      email: String(form.get("email") ?? ""),
    };
  const supabase = await createClient();
  // O link vem do modelo "Reset password" do Auth: {{ .SiteURL }}/auth/confirm?token_hash=…&type=recovery.
  // Erro do Supabase fica no log (cliente do servidor, T13) e não muda a resposta.
  await supabase.auth.resetPasswordForEmail(email);
  return { sent: true, message: SENT };
}
