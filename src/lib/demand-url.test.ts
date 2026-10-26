import { expect, test, vi } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { act, renderHook, waitFor } from "@testing-library/react";
import { demandIdFromPath, demandPath, useOpenDemand } from "./demand-url";

vi.mock("next/navigation", () => ({ usePathname: () => "/demandas/d7" }));

test("demandIdFromPath reads the id only from /demandas/{id}", () => {
  expect(demandIdFromPath("/demandas/d1")).toBe("d1");
  expect(demandIdFromPath("/demandas/c-a%20b")).toBe("c-a b");
  expect(demandIdFromPath("/demandas")).toBeNull();
  expect(demandIdFromPath("/demandas/")).toBeNull();
  expect(demandIdFromPath("/demandas/d1/x")).toBeNull();
  expect(demandIdFromPath("/")).toBeNull();
  expect(demandIdFromPath("/demandas/%E0")).toBeNull();
});

test("demandPath encodes the id and round-trips", () => {
  expect(demandPath("c-a b")).toBe("/demandas/c-a%20b");
  expect(demandIdFromPath(demandPath("x/y"))).toBe("x/y");
});

test("useOpenDemand: open pushes the address, close goes back, a repeated close does nothing", async () => {
  history.replaceState(null, "", "/demandas");
  const { result, unmount } = renderHook(() => useOpenDemand());
  expect(result.current[0]).toBeNull();

  act(() => result.current[1]("d1"));
  expect(location.pathname).toBe("/demandas/d1");
  expect(result.current[0]).toBe("d1");

  act(() => result.current[2]());
  await waitFor(() => expect(result.current[0]).toBeNull());
  expect(location.pathname).toBe("/demandas");
  act(() => result.current[2]());
  await new Promise((r) => setTimeout(r, 20));
  expect(location.pathname).toBe("/demandas");
  // desmontar solta os ouvintes do endereço
  unmount();
  act(() => window.history.pushState(null, "", "/demandas/d2"));
});

test("on the server the open id comes from the Next address", () => {
  function Probe() {
    return useOpenDemand()[0];
  }
  expect(renderToString(createElement(Probe))).toBe("d7");
});
