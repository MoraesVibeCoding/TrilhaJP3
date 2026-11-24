"use server";

import { createClient as createAnonClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/auth";
import { parseCurrentPassword, type PasswordErrors } from "@/lib/password";
import { createClient } from "@/lib/supabase/server";

export type PasswordState =
  | { ok: true; message: string }
  | { ok: false; errors: PasswordErrors }
  | undefined;

// Confere a senha atual num cliente sem sessão: não mexe nos cookies de quem está logado.
async function currentMatches(email: string, password: string) {
  const anon = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await anon.auth.signInWithPassword({ email, password });
  return !error;
}

export async function changePassword(
  _previous: PasswordState,
  form: FormData,
): Promise<PasswordState> {
  const user = await getCurrentUser();
  const input = parseCurrentPassword(form);
  if (!input.ok) return input;
  if (!user.email || !(await currentMatches(user.email, input.current)))
    return { ok: false, errors: { current: "A senha atual não confere." } };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: input.password,
  });
  if (error)
    return {
      ok: false,
      errors: { password: "Não foi possível trocar a senha. Tente de novo." },
    };
  return { ok: true, message: "Senha trocada." };
}
