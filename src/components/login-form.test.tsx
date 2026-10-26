import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const search = vi.hoisted(() => ({ current: "" }));
const signIn = vi.hoisted(() =>
  vi.fn(async (_state: unknown, form: FormData) => ({
    error: "E-mail ou senha incorretos. Confira e tente de novo.",
    email: String(form.get("email")),
  })),
);
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(search.current),
}));
vi.mock("@/app/entrar/actions", () => ({ signIn }));

const { LoginForm } = await import("./login-form");

afterEach(() => {
  cleanup();
  search.current = "";
  signIn.mockClear();
});

test("campos com rótulo e autocompletar do gerenciador de senhas", () => {
  render(<LoginForm />);
  expect(screen.getByLabelText("E-mail").getAttribute("autocomplete")).toBe(
    "username",
  );
  expect(screen.getByLabelText("Senha").getAttribute("autocomplete")).toBe(
    "current-password",
  );
  expect(screen.getByRole("button", { name: "Entrar" })).toBeDefined();
});

test("leva o destino da URL num campo escondido", () => {
  search.current = "de=%2Fdemandas";
  const { container } = render(<LoginForm />);
  expect(
    container.querySelector<HTMLInputElement>('input[name="de"]')?.value,
  ).toBe("/demandas");
});

test("sem destino na URL, não manda campo de destino", () => {
  const { container } = render(<LoginForm />);
  expect(container.querySelector('input[name="de"]')).toBeNull();
});

test("o erro do servidor aparece no aviso e fica ligado aos campos", async () => {
  render(<LoginForm />);
  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: "pedro@exemplo.com.br" },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: "x" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
  expect(
    await screen.findByText(
      "E-mail ou senha incorretos. Confira e tente de novo.",
    ),
  ).toBeDefined();
  expect(signIn).toHaveBeenCalledOnce();
  expect(screen.getByLabelText("Senha").getAttribute("aria-describedby")).toBe(
    "login-error",
  );
});

test("depois do erro o e-mail continua no campo; a senha, não", async () => {
  render(<LoginForm />);
  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: "pedro@exemplo.com.br" },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: "x" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
  await screen.findByText(
    "E-mail ou senha incorretos. Confira e tente de novo.",
  );
  expect((screen.getByLabelText("E-mail") as HTMLInputElement).value).toBe(
    "pedro@exemplo.com.br",
  );
  expect((screen.getByLabelText("Senha") as HTMLInputElement).value).toBe("");
});
