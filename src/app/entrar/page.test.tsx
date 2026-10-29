import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("./actions", () => ({ signIn: vi.fn() }));

const { default: LoginPage, metadata } = await import("./page");

afterEach(cleanup);

test("mesa dividida: a marca na faixa e o formulário ao lado", () => {
  render(<LoginPage />);
  expect(screen.getByRole("complementary").textContent).toContain(
    "Projetos e demandas da Moraes Coding.",
  );
  expect(screen.getByRole("main").querySelector("h1")?.textContent).toBe(
    "Entrar",
  );
  expect(metadata.title).toBe("Entrar · TrilhaJp3");
});
