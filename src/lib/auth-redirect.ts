// Regras de redirecionamento do login (tasks/t3-spec.md, item 3.2), sem rede: o Proxy só aplica.
export const LOGIN_PATH = "/entrar";

const BASE = "http://app.invalid";

// Destino depois do login: só caminho interno, senão o parâmetro vira redirecionamento aberto.
export function safeNext(value: string | null | undefined): string {
  if (!value?.startsWith("/")) return "/";
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return "/";
  }
  if (decoded.startsWith("//") || decoded.includes("\\")) return "/";
  const url = new URL(value, BASE);
  if (url.origin !== BASE || url.pathname === LOGIN_PATH) return "/";
  return url.pathname + url.search;
}

export const FORGOT_PATH = "/entrar/esqueci";
// O link do e-mail troca o token por sessão: abre com ou sem sessão (tasks/senha-spec.md).
export const CONFIRM_PATH = "/auth/confirm";

// Para onde mandar a requisição, ou null para seguir.
export function redirectFor(
  pathname: string,
  search: string,
  signedIn: boolean,
): string | null {
  if (pathname === CONFIRM_PATH) return null;
  if (pathname === FORGOT_PATH) return signedIn ? "/" : null;
  if (pathname === LOGIN_PATH) {
    return signedIn ? safeNext(new URLSearchParams(search).get("de")) : null;
  }
  if (signedIn) return null;
  const from = pathname + search;
  return from === "/"
    ? LOGIN_PATH
    : `${LOGIN_PATH}?de=${encodeURIComponent(from)}`;
}
