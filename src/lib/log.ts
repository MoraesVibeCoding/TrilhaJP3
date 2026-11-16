// T13: logs estruturados em JSON, lidos no painel da Vercel (tasks/t13-spec.md, seção 2, item 2).
// Só campos desta lista saem: nunca senha, token, chave, comentário ou nome de arquivo do usuário.
import { headers } from "next/headers";
import { REQUEST_ID_HEADER } from "./request-id";

type Fields = {
  requestId?: string;
  route?: string;
  routeType?: string;
  method?: string;
  path?: string;
  target?: string;
  status?: number;
  durationMs?: number;
  digest?: string;
  error?: string;
};
const ALLOWED = [
  "requestId",
  "route",
  "routeType",
  "method",
  "path",
  "target",
  "status",
  "durationMs",
  "digest",
  "error",
] as const satisfies readonly (keyof Fields)[];
const MAX_ERROR = 500;

export function logError(event: string, fields: Fields) {
  const line: Record<string, unknown> = { level: "error", event };
  for (const key of ALLOWED) {
    const value = fields[key];
    if (value === undefined) continue;
    line[key] = key === "error" ? String(value).slice(0, MAX_ERROR) : value;
  }
  console.error(JSON.stringify(line));
}

// O Proxy grava o id em cada requisição (src/lib/request-id.ts).
export async function currentRequestId() {
  return (await headers()).get(REQUEST_ID_HEADER) ?? undefined;
}

// "rest/tasks", "storage/object/sign/attachments", "auth/token": sem ids, filtros nem nomes de arquivo.
export function supabaseTarget(url: string) {
  let parts: string[];
  try {
    parts = new URL(url).pathname.split("/").filter(Boolean);
  } catch {
    return "desconhecido";
  }
  const [service, , ...rest] = parts; // ["rest", "v1", "tasks"]
  if (service === "storage") {
    // object/[sign|public|...]/<bucket>/<caminho do arquivo>: para no bucket.
    const keep = rest[1] === "sign" || rest[1] === "public" ? 3 : 2;
    return [service, ...rest.slice(0, keep)].join("/");
  }
  if (service === "rest" && rest[0] === "rpc")
    return [service, ...rest.slice(0, 2)].join("/");
  return [service, ...rest.slice(0, 1)].join("/");
}

// fetch do cliente do Supabase no servidor: toda resposta de erro vira uma linha de log.
// O corpo da resposta não entra no log (pode trazer dado do usuário) e segue intacto para o supabase-js.
export function loggedFetch(requestId: string | undefined): typeof fetch {
  return async (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    const method =
      init?.method ?? (input instanceof Request ? input.method : "GET");
    const start = performance.now();
    const base = { requestId, method, target: supabaseTarget(url) };
    try {
      const res = await fetch(input, init);
      if (!res.ok)
        logError("supabase.error", {
          ...base,
          status: res.status,
          durationMs: Math.round(performance.now() - start),
        });
      return res;
    } catch (error) {
      logError("supabase.error", {
        ...base,
        durationMs: Math.round(performance.now() - start),
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };
}
