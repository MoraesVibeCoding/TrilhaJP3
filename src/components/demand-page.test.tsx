import { afterEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { DemandPage, type PageDemand } from "./demand-page";

// A gravação fica pendente: a tela mostra a mudança otimista, como enquanto o servidor responde.
const updateDemand = vi.hoisted(() => vi.fn());
// O React junta as transições: uma gravação que nunca termina seguraria a do formulário de edição.
const pending = vi.hoisted(() => [] as ((ok: boolean) => void)[]);
vi.mock("@/app/(app)/demandas/actions", () => {
  const saving = () => new Promise<boolean>((resolve) => pending.push(resolve));
  return {
    moveDemand: saving,
    concludeStep: saving,
    setNow: saving,
    updateDemand,
  };
});

afterEach(async () => {
  await act(async () => pending.splice(0).forEach((resolve) => resolve(true)));
  cleanup();
});

const projects = [{ id: "p1", name: "Site institucional" }];
const now = new Date(2026, 9, 22, 15, 0);

const demand: PageDemand = {
  id: "d1",
  projectId: "p1",
  title: "Revisar textos da página inicial",
  state: "Fazendo",
  priority: "Alta",
  lastActivityAt: "2026-10-21T17:00:00",
  subtasks: [
    { title: "Home", done: true },
    { title: "Contato", done: false },
    { title: "Rodapé", done: false },
  ],
  comments: [
    { author: "Pedro", at: "ontem, 17h", text: "Falta revisar o contato." },
  ],
  attachments: [{ name: "textos-v2.pdf" }],
  history: [{ at: "20 de out.", text: "Demanda criada" }],
};

const setup = (id = "d1") =>
  render(
    <DemandPage id={id} demands={[demand]} projects={projects} now={now} />,
  );

test("shows the demand as a page: title, path back, metadata", () => {
  setup();
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "Revisar textos da página inicial",
    }),
  ).toBeDefined();
  expect(
    screen.getByRole("link", { name: "Demandas" }).getAttribute("href"),
  ).toBe("/demandas");
  expect(screen.getByText("Fazendo")).toBeDefined();
  expect(screen.getByText("Prioridade Alta")).toBeDefined();
  expect(screen.getByText(/Última atividade ontem, 17h/)).toBeDefined();
});

test("every group is open at once, in reading order", () => {
  setup();
  const headings = screen
    .getAllByRole("heading", { level: 2 })
    .map((h) => h.textContent);
  expect(headings).toEqual([
    "Subtarefas (3)",
    "Agora",
    "Comentários (1)",
    "Anexos (1)",
    "Histórico (1)",
  ]);
  expect(screen.getByText("Falta revisar o contato.")).toBeDefined();
  expect(screen.getByText("textos-v2.pdf")).toBeDefined();
  expect(screen.getByText("Demanda criada")).toBeDefined();
});

test("Concluir passo advances the step and marks it in the list", () => {
  setup();
  const agora = screen.getByRole("region", { name: "Agora" });
  expect(within(agora).getByText("Contato")).toBeDefined();
  fireEvent.click(
    within(agora).getByRole("button", { name: "Concluir passo" }),
  );
  expect(within(agora).getByText("Rodapé")).toBeDefined();
  expect(within(agora).getByText("Passo 3 de 3")).toBeDefined();
  const list = screen.getByRole("list", { name: "Subtarefas" });
  expect(
    within(list)
      .getByText("Rodapé")
      .closest("li")!
      .getAttribute("aria-current"),
  ).toBe("step");
});

test("Marcar como Agora toggles", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Marcar como Agora" }));
  expect(screen.getByRole("button", { name: "Tirar de Agora" })).toBeDefined();
});

test("an unknown id says so and links back", () => {
  setup("nope");
  expect(screen.getByText("Demanda não encontrada.")).toBeDefined();
  expect(
    screen
      .getByRole("link", { name: "Voltar para Demandas" })
      .getAttribute("href"),
  ).toBe("/demandas");
});

test("Copiar link copies the page address and says so", async () => {
  const writeText = vi.fn(() => Promise.resolve());
  vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Copiar link" }));
  expect(await screen.findByText("Link copiado.")).toBeDefined();
  expect(writeText).toHaveBeenCalledWith(`${location.origin}/demandas/d1`);
  vi.unstubAllGlobals();
});

test("when copying fails, it says where the address is", async () => {
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: { writeText: () => Promise.reject(new Error("no")) },
  });
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Copiar link" }));
  expect(
    await screen.findByText(
      "Não deu para copiar. O endereço está na barra do navegador.",
    ),
  ).toBeDefined();
  vi.unstubAllGlobals();
});

test("without a clipboard (not a secure context) it says where the address is", async () => {
  vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Copiar link" }));
  expect(
    await screen.findByText(
      "Não deu para copiar. O endereço está na barra do navegador.",
    ),
  ).toBeDefined();
  vi.unstubAllGlobals();
});

test("the current subtask says agora in text, not only in color", () => {
  setup();
  const list = screen.getByRole("list", { name: "Subtarefas" });
  expect(within(list).getByText("Contato").closest("li")!.textContent).toBe(
    "Contato agora",
  );
});

const edit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Editar" }));
const editForm = () => screen.getByRole("form", { name: "Editar demanda" });

test("description and due date show in the header when they exist", () => {
  render(
    <DemandPage
      id="d1"
      demands={[
        { ...demand, description: "Com o cliente.", dueDate: "2026-10-30" },
      ]}
      projects={projects}
      now={now}
    />,
  );
  expect(screen.getByText("Com o cliente.")).toBeDefined();
  expect(screen.getByText("Prazo 30 de out.")).toBeDefined();
});

test("Editar opens the header as a form with the current values, title focused", () => {
  setup();
  edit();
  const form = editForm();
  const title = within(form).getByLabelText("Título") as HTMLInputElement;
  expect(title.value).toBe("Revisar textos da página inicial");
  expect(document.activeElement).toBe(title);
  expect(
    (within(form).getByLabelText("Prioridade") as HTMLSelectElement).value,
  ).toBe("high");
  expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
});

test("Cancelar closes without saving and focus returns to Editar", async () => {
  setup();
  edit();
  fireEvent.click(within(editForm()).getByRole("button", { name: "Cancelar" }));
  expect(screen.queryByRole("form", { name: "Editar demanda" })).toBeNull();
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Editar" }),
    ),
  );
  expect(updateDemand).not.toHaveBeenCalled();
});

test("Salvar sends the fields; when saved, the form closes and says so", async () => {
  updateDemand.mockResolvedValueOnce({ saved: true });
  setup();
  edit();
  fireEvent.click(within(editForm()).getByRole("button", { name: "Salvar" }));
  await waitFor(() =>
    expect(screen.queryByRole("form", { name: "Editar demanda" })).toBeNull(),
  );
  const sent = updateDemand.mock.calls[0][1] as FormData;
  expect(sent.get("id")).toBe("d1");
  expect(sent.get("title")).toBe("Revisar textos da página inicial");
  expect(screen.getByRole("status").textContent).toBe("Demanda salva.");
});

test("a field error shows next to the field, which gets the focus", async () => {
  updateDemand.mockResolvedValueOnce({
    errors: { title: "Dê um título à demanda." },
    values: { title: "", description: "", priority: "high", due_date: "" },
  });
  setup();
  edit();
  fireEvent.click(within(editForm()).getByRole("button", { name: "Salvar" }));
  const error = await within(editForm()).findByText("Dê um título à demanda.");
  const title = within(editForm()).getByLabelText("Título");
  expect(title.getAttribute("aria-invalid")).toBe("true");
  expect(title.getAttribute("aria-describedby")).toBe(error.id);
  await waitFor(() => expect(document.activeElement).toBe(title));
});
