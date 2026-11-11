import type { NextRequest } from "next/server";
import { stampRequestId } from "@/lib/request-id";
import { updateSession } from "@/lib/supabase/proxy";

export function proxy(request: NextRequest) {
  // updateSession repassa os cabeçalhos da requisição (NextResponse.next({ request })).
  stampRequestId(request.headers);
  return updateSession(request);
}

// Fora do Proxy: arquivos do Next, ícones e manifest (o PWA precisa deles sem login).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-icon\\.png|icons/|manifest\\.webmanifest).*)",
  ],
};
