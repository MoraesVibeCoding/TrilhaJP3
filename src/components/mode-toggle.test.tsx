import { afterEach, beforeEach, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ModeToggle } from "./mode-toggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-mode");
});
afterEach(cleanup);

test("starts in full mode and offers to switch to focus", () => {
  render(<ModeToggle />);
  const button = screen.getByRole("button", { name: "Ativar modo foco" });
  expect(button.getAttribute("aria-pressed")).toBe("false");
  expect(button.getAttribute("title")).toContain("F");
});

test("click applies focus mode to <html>, persists it and announces it", async () => {
  render(<ModeToggle />);
  fireEvent.click(screen.getByRole("button", { name: "Ativar modo foco" }));
  expect(document.documentElement.dataset.mode).toBe("focus");
  expect(localStorage.getItem("trilhajp3-mode")).toBe("focus");
  const back = await screen.findByRole("button", {
    name: "Ativar modo completo",
  });
  expect(back.getAttribute("aria-pressed")).toBe("true");
  expect((await screen.findByRole("status")).textContent).toBe(
    "Modo foco ativado",
  );
});

test("reflects a mode already applied by the head script", async () => {
  document.documentElement.dataset.mode = "focus";
  render(<ModeToggle />);
  expect(
    await screen.findByRole("button", { name: "Ativar modo completo" }),
  ).toBeDefined();
});

test("the F key toggles the mode", () => {
  render(<ModeToggle />);
  fireEvent.keyDown(document.body, { key: "f" });
  expect(document.documentElement.dataset.mode).toBe("focus");
  fireEvent.keyDown(document.body, { key: "F" });
  expect(document.documentElement.dataset.mode).toBe("full");
});

test("the F key is ignored while typing and with modifiers", () => {
  render(
    <>
      <ModeToggle />
      <input aria-label="campo" />
    </>,
  );
  fireEvent.keyDown(screen.getByLabelText("campo"), { key: "f" });
  fireEvent.keyDown(document.body, { key: "f", ctrlKey: true });
  fireEvent.keyDown(document.body, { key: "f", metaKey: true });
  expect(document.documentElement.dataset.mode).toBeUndefined();
});
