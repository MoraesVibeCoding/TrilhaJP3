import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { currentRequestId, loggedFetch } from "@/lib/log";

// Um cliente novo por requisição (exigência do @supabase/ssr): nunca compartilhar entre usuários.
export async function createClient() {
  const cookieStore = await cookies();
  const requestId = await currentRequestId();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // T13: toda resposta de erro do Supabase vira uma linha de log, com o id da requisição.
      global: { fetch: loggedFetch(requestId) },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component não grava cookie; o Proxy renova a sessão na próxima requisição.
            return;
          }
        },
      },
    },
  );
}
