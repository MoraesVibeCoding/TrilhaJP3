import { afterEach, expect, test } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useCapturedDemands } from "./use-captured";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const made = (id: string) => ({
  id,
  title: "Nova",
  projectId: "p1",
  priority: "Média",
  state: "A fazer",
  lastActivityAt: "2026-10-23T12:00:00.000Z",
});

let n = 0;
const key = () => `captured-test-${n++}`;

test("reads what the browser kept and replaces it; another component sees it at once", () => {
  const k = key();
  localStorage.setItem(k, JSON.stringify([made("c-1"), made("c-2")]));
  const a = renderHook(() => useCapturedDemands(k));
  const b = renderHook(() => useCapturedDemands(k));
  expect(a.result.current[0].map((d) => d.id)).toEqual(["c-1", "c-2"]);
  act(() => a.result.current[1]([a.result.current[0][1]]));
  expect(b.result.current[0].map((d) => d.id)).toEqual(["c-2"]);
});

test("tampered storage is ignored instead of breaking the page", () => {
  const k = key();
  localStorage.setItem(k, JSON.stringify([{ id: 1 }, "x", null]));
  const { result } = renderHook(() => useCapturedDemands(k));
  expect(result.current[0]).toEqual([]);
});
