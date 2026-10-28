import { afterEach, beforeEach, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});
afterEach(cleanup);

test("starts light and offers to switch to dark", () => {
  render(<ThemeToggle />);
  const button = screen.getByRole("button", { name: "Ativar modo escuro" });
  expect(button.getAttribute("aria-pressed")).toBe("false");
});

test("click applies dark theme to <html> and persists it", async () => {
  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole("button", { name: "Ativar modo escuro" }));
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("trilhajp3-theme")).toBe("dark");
  const back = await screen.findByRole("button", { name: "Ativar modo claro" });
  expect(back.getAttribute("aria-pressed")).toBe("true");
});

test("reflects a theme already applied to <html> by the head script", async () => {
  document.documentElement.dataset.theme = "dark";
  render(<ThemeToggle />);
  expect(
    await screen.findByRole("button", { name: "Ativar modo claro" }),
  ).toBeDefined();
});

// Fatia 2 da marca, opção C: o nome da ação à vista ao lado do ícone (no celular o CSS esconde o nome).
test("names the action next to the icon: Escuro, then Claro", async () => {
  render(<ThemeToggle />);
  const button = screen.getByRole("button", { name: "Ativar modo escuro" });
  expect(button.querySelector(".toggle-label")!.textContent).toBe("Escuro");
  expect(button.querySelector("svg")!.getAttribute("stroke-linecap")).toBe(
    "square",
  );
  fireEvent.click(button);
  const back = await screen.findByRole("button", { name: "Ativar modo claro" });
  expect(back.querySelector(".toggle-label")!.textContent).toBe("Claro");
});
