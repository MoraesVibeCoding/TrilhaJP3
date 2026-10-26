import { beforeEach, expect, test, vi } from "vitest";
import { THEME_STORAGE_KEY, themeScript } from "./theme-script";

const run = () => new Function(themeScript)();

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  vi.restoreAllMocks();
});

test("applies the saved dark theme before hydration", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "dark");
  run();
  expect(document.documentElement.dataset.theme).toBe("dark");
});

test("applies the saved light theme", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "light");
  run();
  expect(document.documentElement.dataset.theme).toBe("light");
});

test("ignores an invalid saved value", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "<script>");
  run();
  expect(document.documentElement.dataset.theme).toBeUndefined();
});

test("does nothing when nothing is saved", () => {
  run();
  expect(document.documentElement.dataset.theme).toBeUndefined();
});

test("does not throw when storage is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  expect(run).not.toThrow();
});
