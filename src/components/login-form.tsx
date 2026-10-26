"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { signIn } from "@/app/entrar/actions";

// O destino vem da URL (?de=); o servidor só aceita caminho interno (safeNext).
function NextField() {
  const next = useSearchParams().get("de");
  return next ? <input type="hidden" name="de" value={next} /> : null;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form className="login-form" action={action}>
      <p id="login-error" className="login-error" role="alert">
        {state?.error}
      </p>
      <Suspense>
        <NextField />
      </Suspense>
      <label className="login-field">
        E-mail
        <input
          className="login-input"
          type="email"
          name="email"
          autoComplete="username"
          required
          aria-describedby={state?.error ? "login-error" : undefined}
        />
      </label>
      <label className="login-field">
        Senha
        <input
          className="login-input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          aria-describedby={state?.error ? "login-error" : undefined}
        />
      </label>
      <button className="primary-button" type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
