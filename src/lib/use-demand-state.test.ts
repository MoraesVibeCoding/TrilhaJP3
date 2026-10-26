import { expect, test } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { CHANGES_STORAGE, useDemandState } from "./use-demand-state";

const demands = [
  {
    id: "a",
    state: "Fazendo",
    lastActivityAt: "2026-10-20T10:00:00",
    subtasks: [],
  },
  {
    id: "b",
    state: "Feito",
    lastActivityAt: "2026-10-19T10:00:00",
    doneAt: "2026-10-19T10:00:00",
    subtasks: [],
  },
] as const;

const setup = () => renderHook(() => useDemandState(demands));
const get = (r: ReturnType<typeof setup>, id: string) =>
  r.result.current.current.find((d) => d.id === id)!;

test("moveTo changes the state and refreshes the activity", () => {
  const r = setup();
  act(() => r.result.current.moveTo("a", "A fazer"));
  expect(get(r, "a").state).toBe("A fazer");
  expect(get(r, "a").lastActivityAt).not.toBe("2026-10-20T10:00:00");
});

test("moving to Feito stamps doneAt; leaving Feito clears it", () => {
  const r = setup();
  act(() => r.result.current.moveTo("a", "Feito"));
  expect(get(r, "a").doneAt).toBeDefined();
  act(() => r.result.current.moveTo("b", "Fazendo"));
  expect(get(r, "b").doneAt).toBeUndefined();
});

test("moving to the state it already has changes nothing", () => {
  const r = setup();
  act(() => r.result.current.moveTo("a", "Fazendo"));
  expect(get(r, "a").lastActivityAt).toBe("2026-10-20T10:00:00");
});

test("an unknown id is ignored", () => {
  const r = setup();
  act(() => r.result.current.moveTo("zzz", "Feito"));
  expect(r.result.current.current).toHaveLength(2);
});

const withSteps = [
  {
    id: "c",
    state: "Fazendo",
    lastActivityAt: "2026-10-20T10:00:00",
    subtasks: [
      { title: "Um", done: false },
      { title: "Dois", done: false },
    ],
  },
] as const;

test("changes survive a remount (another page, a reload)", () => {
  const first = renderHook(() => useDemandState(withSteps));
  act(() => first.result.current.conclude("c"));
  act(() => first.result.current.toggleNow("c"));
  act(() => first.result.current.moveTo("c", "Feito"));
  first.unmount();

  const again = renderHook(() => useDemandState(withSteps));
  const c = again.result.current.current[0];
  expect(c.subtasks.map((s) => s.done)).toEqual([true, false]);
  expect(c.isNow).toBe(true);
  expect(c.state).toBe("Feito");
});

test("a stored value with the wrong shape falls back to the data", () => {
  localStorage.setItem(
    CHANGES_STORAGE,
    JSON.stringify({ subtasks: { c: "x" }, moves: { c: 3 }, nowId: 7 }),
  );
  const r = renderHook(() => useDemandState(withSteps));
  const c = r.result.current.current[0];
  expect(c.subtasks.map((s) => s.done)).toEqual([false, false]);
  expect(c.state).toBe("Fazendo");
  expect(c.isNow).toBeUndefined();
});

test("concluding a demand added after the first render works", () => {
  const { result, rerender } = renderHook(({ list }) => useDemandState(list), {
    initialProps: { list: [] as (typeof withSteps)[number][] },
  });
  rerender({ list: [...withSteps] });
  act(() => result.current.conclude("c"));
  expect(result.current.current[0].subtasks[0].done).toBe(true);
});

test("a stored value that is not an object falls back to the data", () => {
  localStorage.setItem(CHANGES_STORAGE, JSON.stringify("x"));
  const r = renderHook(() => useDemandState(withSteps));
  expect(r.result.current.current[0].state).toBe("Fazendo");
});

test("concluding with no pending step, or an unknown id, changes nothing", () => {
  const r = renderHook(() => useDemandState(withSteps));
  act(() => r.result.current.conclude("c"));
  act(() => r.result.current.conclude("c"));
  act(() => r.result.current.conclude("c"));
  act(() => r.result.current.conclude("zzz"));
  expect(r.result.current.current[0].subtasks.map((s) => s.done)).toEqual([
    true,
    true,
  ]);
  expect(localStorage.getItem(CHANGES_STORAGE)).not.toContain("zzz");
});

test("toggling Agora twice leaves no demand marked", () => {
  const r = renderHook(() => useDemandState(withSteps));
  act(() => r.result.current.toggleNow("c"));
  act(() => r.result.current.toggleNow("c"));
  expect(r.result.current.current[0].isNow).toBe(false);
});
