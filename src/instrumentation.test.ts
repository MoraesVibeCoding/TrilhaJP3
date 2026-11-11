import { afterEach, expect, test, vi } from "vitest";
import { onRequestError } from "./instrumentation";

afterEach(() => vi.restoreAllMocks());

const context = {
  routerKind: "App Router",
  routePath: "/(app)/demandas/[id]",
  routeType: "action",
  renderSource: "react-server-components",
  revalidateReason: undefined,
  renderType: "dynamic",
} as const;

test("erro inesperado do servidor vira uma linha JSON com rota, id e mensagem, sem a query nem cabeçalhos", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const error = Object.assign(new Error("Cannot read properties of null"), {
    digest: "123456",
  });
  await onRequestError(
    error,
    {
      path: "/demandas/d1?token=segredo",
      method: "POST",
      headers: { "x-request-id": "gru1::abc", cookie: "sb=sessao" },
    },
    context,
  );
  expect(log).toHaveBeenCalledTimes(1);
  const line = JSON.parse(log.mock.calls[0][0] as string);
  expect(line).toEqual({
    level: "error",
    event: "request.error",
    requestId: "gru1::abc",
    route: "/(app)/demandas/[id]",
    routeType: "action",
    method: "POST",
    path: "/demandas/d1",
    digest: "123456",
    error: "Cannot read properties of null",
  });
  expect(JSON.stringify(line)).not.toContain("segredo");
  expect(JSON.stringify(line)).not.toContain("sessao");
});

test("valor que não é Error também entra, como texto", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  await onRequestError(
    "falhou",
    { path: "/", method: "GET", headers: {} },
    {
      ...context,
      routeType: "render",
    },
  );
  expect(JSON.parse(log.mock.calls[0][0] as string)).toMatchObject({
    event: "request.error",
    routeType: "render",
    path: "/",
    error: "falhou",
  });
});
