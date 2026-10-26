import { afterEach, expect, test } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useCapturedDemands, useWithCaptured } from "./use-captured";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const base = [{ id: "d1", title: "Já existe" }];
const made = (id: string) => ({
  id,
  title: "Nova",
  projectId: "p1",
  priority: "Média" as const,
  state: "A fazer" as const,
  subtasks: [] as [],
  comments: [] as [],
  attachments: [] as [],
  history: [] as [],
  lastActivityAt: "2026-10-23T12:00:00.000Z",
});

let n = 0;
const key = () => `captured-test-${n++}`;

test("an added demand is stored and merged after the originals", () => {
  const k = key();
  const { result } = renderHook(() => ({
    captured: useCapturedDemands(k),
    merged: useWithCaptured(base, k),
  }));
  act(() => result.current.captured[1](made("c-1")));
  expect(result.current.merged.map((d) => d.id)).toEqual(["d1", "c-1"]);
});

test("another component on the same key sees it at once", () => {
  const k = key();
  const a = renderHook(() => useCapturedDemands(k));
  const b = renderHook(() => useWithCaptured(base, k));
  act(() => a.result.current[1](made("c-2")));
  expect(b.result.current.map((d) => d.id)).toEqual(["d1", "c-2"]);
});

test("tampered storage is ignored instead of breaking the page", () => {
  const k = key();
  localStorage.setItem(k, JSON.stringify([{ id: 1 }, "x", null]));
  const { result } = renderHook(() => useWithCaptured(base, k));
  expect(result.current).toEqual(base);
});
