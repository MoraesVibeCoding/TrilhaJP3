import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AppShell } from "./app-shell";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));
const signOut = vi.hoisted(() => vi.fn());
vi.mock("@/app/entrar/actions", () => ({ signOut }));

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

test("marks Projetos as current on its page (T4)", () => {
  pathname.current = "/projetos";
  render(<AppShell>x</AppShell>);
  expect(
    screen.getByRole("link", { name: "Projetos" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(
    screen.getByRole("link", { name: "Retomar" }).getAttribute("aria-current"),
  ).toBeNull();
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

test("Projetos is a working link now (T4), no longer coming soon", () => {
  render(<AppShell>x</AppShell>);
  expect(
    screen.getByRole("link", { name: "Projetos" }).getAttribute("href"),
  ).toBe("/projetos");
});

test("offers Sair, which submits the sign-out action", () => {
  render(<AppShell>x</AppShell>);
  const button = screen.getByRole("button", { name: "Sair" });
  expect(button.getAttribute("type")).toBe("submit");
  expect(button.closest("form")).not.toBeNull();
});

test("Sair fica logo depois da navegação, não no pé da barra", () => {
  render(<AppShell>x</AppShell>);
  const next = screen.getByRole("navigation", {
    name: "Principal",
  }).nextElementSibling;
  expect(next?.tagName).toBe("FORM");
  expect(next?.textContent).toBe("Sair");
});

// Tarefa de marca, decisões 3 e 5: o topo mostra o logo e o nome da empresa do usuário, lido do banco.
test("shows the company name next to the logo, and no hard-coded company", () => {
  render(<AppShell company="Moraes Coding">x</AppShell>);
  const names = screen.getAllByText("Moraes Coding");
  expect(names.length).toBeGreaterThan(0);
  for (const n of names) expect(n.className).toBe("brand-name");
  expect(screen.queryByText("Moraes CodeVibe")).toBeNull();
  expect(screen.queryByText("TrilhaJp3")).toBeNull();
});
