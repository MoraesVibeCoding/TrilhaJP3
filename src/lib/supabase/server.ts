import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Um cliente novo por requisição (exigência do @supabase/ssr): nunca compartilhar entre usuários.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
