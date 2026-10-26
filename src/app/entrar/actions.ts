"use server";

import { redirect } from "next/navigation";
import { LOGIN_PATH, safeNext } from "@/lib/auth-redirect";
import { parseSignIn } from "@/lib/sign-in-input";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { error: string } | undefined;

// Uma mensagem só: não diz se o e-mail existe nem qual campo errou.
const FAILED = "E-mail ou senha incorretos. Confira e tente de novo.";

export async function signIn(
  _previous: SignInState,
  form: FormData,
): Promise<SignInState> {
  const input = parseSignIn(form);
  if (!input) return { error: FAILED };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) return { error: FAILED };
  redirect(safeNext(form.get("de")?.toString()));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(LOGIN_PATH);
}
