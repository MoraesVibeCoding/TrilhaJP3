"use server";

import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/lib/auth-redirect";
import { isRecoverySession, parseNewPassword } from "@/lib/password";
import { createClient } from "@/lib/supabase/server";
import type { PasswordState } from "../conta/actions";

// Só a sessão aberta pelo link do e-mail troca sem a senha atual (tasks/senha-spec.md, item 3).
export async function setNewPassword(
  _previous: PasswordState,
  form: FormData,
): Promise<PasswordState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect(LOGIN_PATH);
  if (!isRecoverySession(data.claims)) redirect("/conta");
  const input = parseNewPassword(form);
  if (!input.ok) return input;
  const { error } = await supabase.auth.updateUser({
    password: input.password,
  });
  if (error)
    return {
      ok: false,
      errors: { password: "Não foi possível trocar a senha. Tente de novo." },
    };
  // Encerra a sessão do link: sem isso ela trocaria a senha de novo, sem a atual, até vencer.
  await supabase.auth.signOut();
  redirect(`${LOGIN_PATH}?senha=trocada`);
}
