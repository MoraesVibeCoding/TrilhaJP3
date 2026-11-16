// T13: um id por requisição, para juntar as linhas de log de uma mesma requisição.
// Na Vercel vem do x-vercel-id (vercel.com/docs/headers/request-headers); o que o cliente mandar é sobrescrito.
export const REQUEST_ID_HEADER = "x-request-id";

export function stampRequestId(headers: Headers) {
  headers.set(
    REQUEST_ID_HEADER,
    headers.get("x-vercel-id") ?? crypto.randomUUID(),
  );
}
