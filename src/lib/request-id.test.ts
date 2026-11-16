import { expect, test } from "vitest";
import { REQUEST_ID_HEADER, stampRequestId } from "./request-id";

test("na Vercel, usa o id que ela põe na requisição", () => {
  const headers = new Headers({ "x-vercel-id": "gru1::iad1::abc-123" });
  stampRequestId(headers);
  expect(headers.get(REQUEST_ID_HEADER)).toBe("gru1::iad1::abc-123");
});

test("fora da Vercel, gera um; e o cliente não escolhe o id", () => {
  const headers = new Headers({ [REQUEST_ID_HEADER]: "forjado" });
  stampRequestId(headers);
  expect(headers.get(REQUEST_ID_HEADER)).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
});
