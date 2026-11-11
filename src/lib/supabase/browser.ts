import { createBrowserClient } from "@supabase/ssr";

// Cliente no navegador, com a sessão dos cookies: usado só para enviar anexos direto ao Storage (T11),
// porque a Server Action aceita só 1 MB. O RLS do Storage decide o que este usuário pode enviar.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
