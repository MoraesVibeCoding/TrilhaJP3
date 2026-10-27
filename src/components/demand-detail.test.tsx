import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DemandDetail, type DetailData } from "./demand-detail";

afterEach(cleanup);

const data = (over: Partial<DetailData> = {}): DetailData => ({
  id: "a",
  title: "Revisar textos",
  state: "Fazendo",
  comments: [
    { author: "Pedro", at: "ontem, 17h", text: "Falta revisar o contato." },
  ],
  attachments: [{ name: "layout.pdf" }],
  history: [{ at: "ontem, 17h", text: "Estado mudou para Fazendo" }],
  ...over,
});

const subs = [
  { title: "Home", done: true },
  { title: "Contato", done: false },
  { title: "Rodapé", done: false },
];

const setup = (
  subtasks: readonly { title: string; done: boolean }[] = subs,
  isNow = false,
) => {
  const onConclude = vi.fn();
  const onToggleNow = vi.fn();
  render(
    <DemandDetail
      data={data()}
      subtasks={subtasks}
      isNow={isNow}
      onConclude={onConclude}
      onToggleNow={onToggleNow}
    />,
  );
  return { onConclude, onToggleNow };
};

test("leads with the next step and the state", () => {
  setup();
  expect(screen.getByText("Fazendo")).toBeDefined();
  const now = screen.getByRole("region", { name: "Agora" });
  expect(now.textContent).toContain("Contato");
  expect(now.textContent).toContain("Passo 2 de 3");
  expect(screen.getByRole("button", { name: "Concluir passo" })).toBeDefined();
});

test("Concluir passo asks the parent to conclude this demand", () => {
  const { onConclude } = setup();
  fireEvent.click(screen.getByRole("button", { name: "Concluir passo" }));
  expect(onConclude).toHaveBeenCalledWith("a");
});

test("says so and hides the button when every step is done", () => {
  setup([{ title: "Home", done: true }]);
  expect(screen.getByText("Sem passos pendentes")).toBeDefined();
  expect(screen.queryByRole("button", { name: "Concluir passo" })).toBeNull();
});

test("without subtasks it says Sem subtarefas and offers nothing to conclude", () => {
  setup([]);
  expect(screen.getAllByText("Sem subtarefas").length).toBeGreaterThan(0);
  expect(screen.queryByRole("button", { name: "Concluir passo" })).toBeNull();
});

test("Marcar como Agora asks the parent to toggle", () => {
  const { onToggleNow } = setup(subs, false);
  fireEvent.click(screen.getByRole("button", { name: "Marcar como Agora" }));
  expect(onToggleNow).toHaveBeenCalledWith("a");
});

test("when it is Agora the button says so in words and can undo it", () => {
  const { onToggleNow } = setup(subs, true);
  expect(
    screen.queryByRole("button", { name: "Marcar como Agora" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Tirar de Agora" }));
  expect(onToggleNow).toHaveBeenCalledWith("a");
});

test("shows step progress with one filled mark per finished step", () => {
  const { container } = render(
    <DemandDetail
      data={data()}
      subtasks={subs}
      isNow={false}
      onConclude={() => {}}
      onToggleNow={() => {}}
    />,
  );
  expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(1);
  expect(container.querySelectorAll("[data-filled]")).toHaveLength(3);
});

test("Concluir passo is the element that should get the initial focus", () => {
  setup();
  expect(
    screen
      .getByRole("button", { name: "Concluir passo" })
      .hasAttribute("data-autofocus"),
  ).toBe(true);
});

test("groups are collapsible with counts; Subtarefas starts open", () => {
  setup();
  const group = (name: string) =>
    screen.getByText(name, { selector: "summary" }).closest("details")!;
  expect(group("Subtarefas (3)").open).toBe(true);
  expect(group("Comentários (1)").open).toBe(false);
  expect(group("Anexos (1)").open).toBe(false);
  expect(group("Histórico (1)").open).toBe(false);
});

// Proposta 4 do impeccable (aprovada em 2026-10-27): o vazio não grita nem repete grupos "(0)".
test("a demand with nothing yet says so in one quiet line, with no empty groups", () => {
  const { container } = render(
    <DemandDetail
      data={data({ comments: [], attachments: [], history: [] })}
      subtasks={[]}
      isNow={false}
      onConclude={vi.fn()}
      onToggleNow={vi.fn()}
    />,
  );
  const line = screen.getByText(
    "Sem subtarefas, comentários, anexos nem histórico",
  );
  expect(line.className).toBe("detail-now-empty");
  expect(container.querySelectorAll("summary")).toHaveLength(0);
});

test("empty groups hide and are named in one line after the others", () => {
  const { container } = render(
    <DemandDetail
      data={data({ attachments: [], history: [] })}
      subtasks={subs}
      isNow={false}
      onConclude={vi.fn()}
      onToggleNow={vi.fn()}
    />,
  );
  expect(
    [...container.querySelectorAll("summary")].map((s) => s.textContent),
  ).toEqual(["Subtarefas (3)", "Comentários (1)"]);
  expect(screen.getByText("Sem anexos nem histórico").className).toBe(
    "detail-empty",
  );
});

test("the all-done note is quiet text, not the size of a step", () => {
  setup([{ title: "Home", done: true }]);
  expect(screen.getByText("Sem passos pendentes").className).toBe(
    "detail-now-empty",
  );
});
