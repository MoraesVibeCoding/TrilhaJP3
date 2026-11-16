// T13: cabeçalhos de segurança de todas as respostas (tasks/t13-spec.md, seção 2, item 1).
// CSP sem nonce: o nonce é incompatível com o cacheComponents (guia do Next 16.4, "Without Nonces").
export function securityHeaders({
  supabaseUrl,
  dev,
}: {
  supabaseUrl: string | undefined;
  dev: boolean;
}) {
  const supabase = originOf(supabaseUrl);
  // O React usa eval só em desenvolvimento, para montar as pilhas de erro no navegador.
  const scripts = [
    "'self'",
    "'unsafe-inline'",
    ...(dev ? ["'unsafe-eval'"] : []),
  ];
  const csp = [
    "default-src 'self'",
    `script-src ${scripts.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    // Miniaturas dos anexos vêm por link assinado do Storage; login e envio falam com o Supabase.
    `img-src 'self' blob: data: ${supabase}`,
    `connect-src 'self' ${supabase}`,
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
  return [
    { key: "Content-Security-Policy", value: `${csp};` },
    // Sem preload: o domínio próprio ainda não existe.
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];
}

function originOf(url: string | undefined) {
  try {
    return new URL(url ?? "").origin;
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL não definida: a CSP precisa do host do Supabase.",
    );
  }
}
