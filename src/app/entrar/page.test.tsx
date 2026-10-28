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
  expect(metadata.title).toBe("Entrar · Trilha JP3");
});

// Proposta 8 do impeccable: sem nome de fornecedor; o produto vai para outras empresas.
test("senha esquecida aponta para quem administra a conta, sem citar fornecedor", () => {
  render(<LoginPage />);
  expect(
    screen.getByText(
      "Esqueceu a senha? Peça a troca a quem administra a conta da empresa.",
    ),
  ).toBeDefined();
  expect(document.body.textContent).not.toContain("Supabase");
});
