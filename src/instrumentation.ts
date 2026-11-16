// T13: todo erro que o Next captura no servidor vira uma linha de log (instrumentation.md, onRequestError).
import type { Instrumentation } from "next";
import { logError } from "@/lib/log";
import { REQUEST_ID_HEADER } from "@/lib/request-id";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const id = request.headers[REQUEST_ID_HEADER];
  logError("request.error", {
    requestId: Array.isArray(id) ? id[0] : id,
    route: context.routePath,
    routeType: context.routeType,
    method: request.method,
    // Sem a query: ela pode levar dado do usuário.
    path: request.path.split("?")[0],
    digest:
      typeof error === "object" && error !== null && "digest" in error
        ? String(error.digest)
        : undefined,
    error: error instanceof Error ? error.message : String(error),
  });
};
