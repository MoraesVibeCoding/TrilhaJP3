import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useStoredState } from "./use-stored-state";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

const DEFAULT = { a: 1 };

test("returns the default when nothing is stored", () => {
  const { result } = renderHook(() => useStoredState("k-default", DEFAULT));
  expect(result.current[0]).toEqual({ a: 1 });
});

test("set persists to localStorage and re-renders", () => {
  const { result } = renderHook(() => useStoredState("k-set", DEFAULT));
  act(() => result.current[1]({ a: 2 }));
  expect(result.current[0]).toEqual({ a: 2 });
  expect(localStorage.getItem("k-set")).toBe('{"a":2}');
});

test("reads a value stored earlier", () => {
  localStorage.setItem("k-read", '{"a":9}');
  const { result } = renderHook(() => useStoredState("k-read", DEFAULT));
  expect(result.current[0]).toEqual({ a: 9 });
});

test("an invalid stored value falls back to the default", () => {
  localStorage.setItem("k-bad", "{nope");
  const { result } = renderHook(() => useStoredState("k-bad", DEFAULT));
  expect(result.current[0]).toEqual({ a: 1 });
});

test("still works in memory when storage is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  const { result } = renderHook(() => useStoredState("k-blocked", DEFAULT));
  act(() => result.current[1]({ a: 5 }));
  expect(result.current[0]).toEqual({ a: 5 });
});

test("with storage working, clearing it also clears the value", () => {
  const { result, unmount } = renderHook(() =>
    useStoredState("k-clear", DEFAULT),
  );
  act(() => result.current[1]({ a: 3 }));
  unmount();
  localStorage.clear();
  const again = renderHook(() => useStoredState("k-clear", DEFAULT));
  expect(again.result.current[0]).toEqual({ a: 1 });
});

test("a stored value of another type (null, text, list) falls back to the default", () => {
  for (const [i, raw] of ["null", '"x"', "[1]", "7"].entries()) {
    localStorage.setItem(`k-type-${i}`, raw);
    const { result } = renderHook(() => useStoredState(`k-type-${i}`, DEFAULT));
    expect(result.current[0]).toEqual({ a: 1 });
  }
});

test("a list default accepts a stored list", () => {
  localStorage.setItem("k-list", "[1,2]");
  const { result } = renderHook(() => useStoredState("k-list", [] as number[]));
  expect(result.current[0]).toEqual([1, 2]);
});
