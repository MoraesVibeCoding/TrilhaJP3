import { afterEach, expect, test } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { CaptureButton } from "./capture-dialog";
import { MAX_CAPTURED } from "@/lib/capture";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

let n = 0;
const setup = () => {
  const keys = { capturedKey: `cap-${n}`, prefsKey: `prefs-${n++}` };
  render(<CaptureButton {...keys} />);
  return keys;
};
const open = () =>
  fireEvent.click(screen.getByRole("button", { name: /Nova demanda/ }));
const dialog = () => screen.getByRole("dialog", { name: "Nova demanda" });
const title = () =>
  within(dialog()).getByRole("textbox", { name: "Título da demanda" });
const type = (value: string) =>
  fireEvent.change(title(), { target: { value } });
const submit = () => fireEvent.submit(title().closest("form")!);
const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? "[]");

test("the button opens the window with the title field focused", () => {
  setup();
  open();
  expect(document.activeElement).toBe(title());
});

test("an empty title shows what to do and keeps the window open", () => {
  setup();
  open();
  submit();
  expect(within(dialog()).getByRole("alert").textContent).toBe(
    "Escreva o título da demanda.",
  );
  expect(dialog()).toBeDefined();
});

test("a valid title creates the demand in A fazer, closes and says so", () => {
  const { capturedKey } = setup();
  open();
  type("Ajustar menu do celular");
  submit();
  expect(screen.queryByRole("dialog")).toBeNull();
  const [d] = stored(capturedKey);
  expect(d).toMatchObject({
    title: "Ajustar menu do celular",
    state: "A fazer",
    priority: "Média",
  });
  expect(screen.getByRole("status").textContent).toContain(
    "Demanda criada: Ajustar menu do celular",
  );
});

test("the window opens with the project and priority defaults and lists all projects", () => {
  setup();
  open();
  const project = within(dialog()).getByRole("combobox", {
    name: "Projeto",
  }) as HTMLSelectElement;
  expect(project.value).toBe("p1");
  expect(within(project).getAllByRole("option")).toHaveLength(4);
  expect(
    (
      within(dialog()).getByRole("combobox", {
        name: "Prioridade",
      }) as HTMLSelectElement
    ).value,
  ).toBe("Média");
});

test("the project used last is remembered for the next demand", () => {
  const { capturedKey } = setup();
  open();
  type("Primeira");
  fireEvent.change(
    within(dialog()).getByRole("combobox", { name: "Projeto" }),
    {
      target: { value: "p3" },
    },
  );
  submit();
  open();
  expect(
    (
      within(dialog()).getByRole("combobox", {
        name: "Projeto",
      }) as HTMLSelectElement
    ).value,
  ).toBe("p3");
  expect(stored(capturedKey)[0].projectId).toBe("p3");
});

test("a similar title warns first and creates only on the second confirmation", () => {
  const { capturedKey } = setup();
  open();
  type("fotos da equipe");
  submit();
  expect(within(dialog()).getByText("Fotos da equipe")).toBeDefined();
  expect(within(dialog()).getByText(/Parecida com/)).toBeDefined();
  expect(stored(capturedKey)).toHaveLength(0);
  fireEvent.click(
    within(dialog()).getByRole("button", { name: "Criar mesmo assim" }),
  );
  expect(stored(capturedKey)).toHaveLength(1);
});

test("editing the title after the warning goes back to the normal button", () => {
  setup();
  open();
  type("fotos da equipe");
  submit();
  type("Outra coisa totalmente diferente");
  expect(
    within(dialog()).getByRole("button", { name: "Criar demanda" }),
  ).toBeDefined();
  expect(within(dialog()).queryByText(/Parecida com/)).toBeNull();
});

test("a demand just captured also counts as similar for the next one", () => {
  setup();
  open();
  type("Ajustar menu do celular");
  submit();
  open();
  type("ajustar menu do celular");
  submit();
  expect(within(dialog()).getByText(/Parecida com/)).toBeDefined();
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

test("Esc cancels and keeps nothing", () => {
  const { capturedKey } = setup();
  open();
  type("Descartar");
  fireEvent.keyDown(dialog(), { key: "Escape" });
  fireEvent(dialog(), new Event("close"));
  expect(stored(capturedKey)).toHaveLength(0);
});

test("with the browser full (500 captured), it refuses and says so instead of losing the demand", () => {
  const { capturedKey } = setup();
  const full = Array.from({ length: MAX_CAPTURED }, (_, i) => ({
    id: `c-${i}`,
    title: `Demanda ${i}`,
    projectId: "p1",
    priority: "Média",
    state: "A fazer",
    lastActivityAt: "2026-10-22T10:00:00.000Z",
  }));
  localStorage.setItem(capturedKey, JSON.stringify(full));
  window.dispatchEvent(new Event("trilhajp3-stored-state"));
  open();
  type("A quinhentos e um");
  submit();
  expect(stored(capturedKey)).toHaveLength(MAX_CAPTURED);
  expect(screen.getByRole("status").textContent).toBe(
    "Não deu para criar: este navegador já guarda 500 demandas, o limite até os dados irem para o banco.",
  );
});
