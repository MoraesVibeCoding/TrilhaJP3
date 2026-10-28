// Camada de acesso (tasks/t3-spec.md, item 3.3): a única porta para saber quem está logado.
// Chame só em código do servidor, dentro de <Suspense> (lê cookies; cacheComponents).
import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | undefined;
  organizationId: string;
  // o nome que o topo mostra (marca configurável por cliente: decisão 3 da tarefa de marca)
  organizationName: string;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  // getClaims() verifica a assinatura do token; getSession() só leria o cookie.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect(LOGIN_PATH);

  // A RLS da T2 só devolve vínculos das empresas do próprio usuário.
  const { data: memberships, error } = await supabase
    .from("memberships")
    .select("organization_id, organizations(name)")
    .limit(1);
  if (error) throw error;
  // Voltar para /entrar com sessão válida faria o Proxy devolver para "/" de novo.
  if (!memberships?.length) throw new Error("Usuário sem empresa vinculada.");

  // vínculo -> empresa é muitos-para-um: o PostgREST devolve um objeto; sem tipos gerados, o cliente supõe lista
  const org = memberships[0].organizations as unknown as {
    name: string;
  } | null;

  return {
    id: data.claims.sub,
    email: data.claims.email,
    organizationId: memberships[0].organization_id,
    organizationName: org?.name ?? "",
  };
}
