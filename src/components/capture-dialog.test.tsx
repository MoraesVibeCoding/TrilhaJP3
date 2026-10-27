import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

const options = {
  projects: [
    { id: "p1", name: "Site" },
    { id: "p2", name: "App" },
    { id: "p3", name: "Painel" },
  ],
  demands: [{ id: "d7", title: "Fotos da equipe" }],
};
const actions = vi.hoisted(() => ({
  captureOptions: vi.fn(),
  createDemand: vi.fn(),
}));
vi.mock("@/app/(app)/demandas/actions", () => actions);

const { CaptureButton } = await import("./capture-dialog");

beforeEach(() => {
  actions.captureOptions.mockReset().mockResolvedValue(options);
  actions.createDemand.mockReset().mockResolvedValue({ ok: true });
});
afterEach(() => {
  cleanup();
  localStorage.clear();
});

let n = 0;
const setup = () => render(<CaptureButton prefsKey={`prefs-${n++}`} />);
const open = () =>
  fireEvent.click(screen.getByRole("button", { name: /Nova demanda/ }));
const dialog = () => screen.getByRole("dialog", { name: "Nova demanda" });
const title = () =>
  within(dialog()).findByRole("textbox", { name: "Título da demanda" });
const type = async (value: string) =>
  fireEvent.change(await title(), { target: { value } });
const submit = async () => fireEvent.submit((await title()).closest("form")!);
const select = (name: string) =>
  within(dialog()).getByRole("combobox", { name }) as HTMLSelectElement;

test("the button opens the window and, once the projects load, focuses the title", async () => {
  setup();
  open();
  expect(within(dialog()).getByText("Carregando…")).toBeDefined();
  const field = await title();
  expect(document.activeElement).toBe(field);
});

test("an empty title shows what to do and keeps the window open", async () => {
  setup();
  open();
  await submit();
  expect(within(dialog()).getByRole("alert").textContent).toBe(
    "Escreva o título da demanda.",
  );
  expect(actions.createDemand).not.toHaveBeenCalled();
});

test("a valid title is saved, the window closes and says so", async () => {
  setup();
  open();
  await type("Ajustar menu do celular");
  await submit();
  expect((await screen.findByRole("status")).textContent).toContain(
    "Demanda criada: Ajustar menu do celular, em Site.",
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(actions.createDemand).toHaveBeenCalledWith({
    title: "Ajustar menu do celular",
    projectId: "p1",
    priority: "Média",
  });
});

test("a failed save keeps the window open with the title and the error", async () => {
  actions.createDemand.mockResolvedValue({
    ok: false,
    error: "Não foi possível criar. Tente de novo.",
  });
  setup();
  open();
  await type("Ajustar menu do celular");
  await submit();
  expect((await within(dialog()).findByRole("alert")).textContent).toBe(
    "Não foi possível criar. Tente de novo.",
  );
  expect(((await title()) as HTMLInputElement).value).toBe(
    "Ajustar menu do celular",
  );
});

test("the window lists the real projects, first one and Média by default", async () => {
  setup();
  open();
  await title();
  expect(select("Projeto").value).toBe("p1");
  expect(within(select("Projeto")).getAllByRole("option")).toHaveLength(3);
  expect(select("Prioridade").value).toBe("Média");
});

test("the project used last is remembered for the next demand", async () => {
  setup();
  open();
  await type("Primeira");
  fireEvent.change(select("Projeto"), { target: { value: "p3" } });
  await submit();
  await screen.findByRole("status");
  open();
  await title();
  expect(select("Projeto").value).toBe("p3");
});

test("a similar title warns first and creates only on the second confirmation", async () => {
  setup();
  open();
  await type("fotos da equipe");
  await submit();
  expect(within(dialog()).getByText("Fotos da equipe")).toBeDefined();
  expect(within(dialog()).getByText(/Parecida com/)).toBeDefined();
  expect(actions.createDemand).not.toHaveBeenCalled();
  fireEvent.click(
    within(dialog()).getByRole("button", { name: "Criar mesmo assim" }),
  );
  await screen.findByText(/Demanda criada/);
  expect(actions.createDemand).toHaveBeenCalledTimes(1);
});

test("editing the title after the warning goes back to the normal button", async () => {
  setup();
  open();
  await type("fotos da equipe");
  await submit();
  await type("Outra coisa totalmente diferente");
  expect(
    within(dialog()).getByRole("button", { name: "Criar demanda" }),
  ).toBeDefined();
  expect(within(dialog()).queryByText(/Parecida com/)).toBeNull();
});

test("projects that fail to load say so instead of an empty form", async () => {
  actions.captureOptions.mockResolvedValue(null);
  setup();
  open();
  expect((await within(dialog()).findByRole("alert")).textContent).toBe(
    "Não foi possível carregar os projetos. Feche e tente de novo.",
  );
});

test("with no project yet, it points to Projetos", async () => {
  actions.captureOptions.mockResolvedValue({ projects: [], demands: [] });
  setup();
  open();
  expect(
    (
      await within(dialog()).findByRole("link", {
        name: "Crie o primeiro em Projetos",
      })
    ).getAttribute("href"),
  ).toBe("/projetos");
});

test("the C key opens the window, but not while typing or with a modifier", () => {
  setup();
  fireEvent.keyDown(document.body, { key: "c", ctrlKey: true });
  expect(screen.queryByRole("dialog")).toBeNull();
  const input = document.createElement("input");
  document.body.append(input);
  fireEvent.keyDown(input, { key: "c" });
  expect(screen.queryByRole("dialog")).toBeNull();
  input.remove();
  fireEvent.keyDown(document.body, { key: "c" });
  expect(dialog()).toBeDefined();
});

test("Esc cancels and saves nothing", async () => {
  setup();
  open();
  await type("Descartar");
  fireEvent.keyDown(dialog(), { key: "Escape" });
  fireEvent(dialog(), new Event("close"));
  expect(actions.createDemand).not.toHaveBeenCalled();
});
