import { beforeEach, expect, test, vi } from "vitest";
import { MODE_STORAGE_KEY, modeScript } from "./mode-script";

const run = () => new Function(modeScript)();

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-mode");
  vi.restoreAllMocks();
});

test("applies the saved focus mode before hydration", () => {
  localStorage.setItem(MODE_STORAGE_KEY, "focus");
  run();
  expect(document.documentElement.dataset.mode).toBe("focus");
});

test("applies the saved full mode", () => {
  localStorage.setItem(MODE_STORAGE_KEY, "full");
  run();
  expect(document.documentElement.dataset.mode).toBe("full");
});

test("ignores an invalid saved value", () => {
  localStorage.setItem(MODE_STORAGE_KEY, "<script>");
  run();
  expect(document.documentElement.dataset.mode).toBeUndefined();
});

test("does nothing when nothing is saved", () => {
  run();
  expect(document.documentElement.dataset.mode).toBeUndefined();
});

test("does not throw when storage is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  expect(run).not.toThrow();
});
