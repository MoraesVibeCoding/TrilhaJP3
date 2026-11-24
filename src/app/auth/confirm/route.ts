// Link do e-mail de recuperação (tasks/senha-spec.md, item 2): troca o token por sessão, em cookie.
// Padrão do guia de SSR do Supabase (exemplo nextjs-user-management, app/auth/confirm/route.ts).
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Hash hexadecimal do Supabase, com o prefixo pkce_ no fluxo PKCE (o padrão do @supabase/ssr).
// Qualquer outra coisa nem vai para o Auth.
const TOKEN = /^(pkce_)?[0-9a-f]{20,128}$/i;

// Destinos fixos: nenhum parâmetro da URL escolhe para onde ir.
const go = (request: NextRequest, path: string) =>
  NextResponse.redirect(new URL(path, request.url), 303);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash") ?? "";
  if (params.get("type") !== "recovery" || !TOKEN.test(tokenHash))
    return go(request, "/entrar?link=invalido");
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: "recovery",
    token_hash: tokenHash,
  });
  return go(request, error ? "/entrar?link=invalido" : "/nova-senha");
}
