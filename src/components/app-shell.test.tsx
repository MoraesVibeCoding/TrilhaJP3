import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AppShell } from "./app-shell";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

afterEach(() => {
  cleanup();
  pathname.current = "/";
});

test("exposes banner, navigation and main landmarks", () => {
  render(
    <AppShell>
      <h1>Conteúdo</h1>
    </AppShell>,
  );
  expect(screen.getByRole("navigation", { name: "Principal" })).toBeDefined();
  expect(screen.getByRole("main")).toBeDefined();
  expect(screen.getByRole("heading", { name: "Conteúdo" })).toBeDefined();
});

test("marks Retomar as current on the home route", () => {
  render(<AppShell>x</AppShell>);
  expect(
    screen.getByRole("link", { name: "Retomar" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(
    screen.getByRole("link", { name: "Demandas" }).getAttribute("aria-current"),
  ).toBeNull();
});

test("marks Demandas as current on /demandas and nested routes", () => {
  pathname.current = "/demandas/abc";
  render(<AppShell>x</AppShell>);
  expect(
    screen.getByRole("link", { name: "Demandas" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(
    screen.getByRole("link", { name: "Retomar" }).getAttribute("aria-current"),
  ).toBeNull();
});

test("keeps Projetos unavailable until it exists", () => {
  render(<AppShell>x</AppShell>);
  expect(screen.queryByRole("link", { name: "Projetos" })).toBeNull();
  expect(screen.getByText("Projetos").getAttribute("aria-disabled")).toBe(
    "true",
  );
});

test("offers a skip link to the main content", () => {
  render(<AppShell>x</AppShell>);
  const skip = screen.getByRole("link", { name: "Pular para o conteúdo" });
  expect(skip.getAttribute("href")).toBe("#conteudo");
  expect(screen.getByRole("main").id).toBe("conteudo");
});

test("menu button toggles the navigation on small screens", () => {
  render(<AppShell>x</AppShell>);
  const button = screen.getByRole("button", { name: "Abrir menu" });
  expect(button.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(button);
  expect(
    screen
      .getByRole("button", { name: "Fechar menu" })
      .getAttribute("aria-expanded"),
  ).toBe("true");
});

test("includes the theme toggle", () => {
  render(<AppShell>x</AppShell>);
  expect(
    screen.getByRole("button", { name: /Ativar modo (escuro|claro)/ }),
  ).toBeDefined();
});

test("includes the focus/complete mode toggle", () => {
  render(<AppShell>x</AppShell>);
  expect(
    screen.getByRole("button", { name: /Ativar modo (foco|completo)/ }),
  ).toBeDefined();
});

test("Projetos is marked as coming soon in words, not only by color", () => {
  render(<AppShell>x</AppShell>);
  expect(screen.getByText("em breve")).toBeDefined();
});
