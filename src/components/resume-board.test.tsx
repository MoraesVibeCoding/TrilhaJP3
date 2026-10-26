import { afterEach, expect, test } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  screen,
  within,
} from "@testing-library/react";
import { ResumeBoard, type BoardDemand } from "./resume-board";

afterEach(cleanup);

const projects = [{ id: "p1", name: "Site" }];
const now = new Date(2026, 9, 22, 15, 0);

const d = (over: Partial<BoardDemand>): BoardDemand => ({
  id: "x",
  projectId: "p1",
  title: "T",
  state: "Fazendo",
  lastActivityAt: "2026-10-20T10:00:00",
  subtasks: [],
  comments: [],
  attachments: [],
  history: [],
  ...over,
});

const demands: BoardDemand[] = [
  d({
    id: "a",
    title: "Revisar textos",
    isNow: true,
    subtasks: [
      { title: "Home", done: true },
      { title: "Contato", done: false },
    ],
  }),
  d({
    id: "b",
    title: "Definir checkout",
    lastActivityAt: "2026-10-19T10:00:00",
  }),
  d({
    id: "c",
    title: "Enviar proposta",
    state: "Feito",
    doneAt: "2026-10-22T11:00:00",
  }),
];

const setup = () =>
  render(<ResumeBoard demands={demands} projects={projects} now={now} />);

test("shows Agora, the rest in progress without repeating it, and Feito hoje", () => {
  setup();
  const nowSection = screen.getByRole("region", { name: "Agora" });
  expect(within(nowSection).getByText("Revisar textos")).toBeDefined();
  const list = screen.getByRole("list", { name: "Em andamento" });
  expect(within(list).queryByText("Revisar textos")).toBeNull();
  expect(within(list).getByText("Definir checkout")).toBeDefined();
  expect(
    screen.getByText("Feito hoje (1)", { selector: "summary" }),
  ).toBeDefined();
});

test("Concluir passo advances Agora and the same step shows in the window", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Concluir passo" }));
  const nowSection = screen.getByRole("region", { name: "Agora" });
  expect(within(nowSection).getByText("Sem passos pendentes")).toBeDefined();
  fireEvent.click(
    within(nowSection).getByRole("button", { name: "Revisar textos" }),
  );
  const dialog = screen.getByRole("dialog", { name: "Revisar textos" });
  expect(within(dialog).getByText("Sem passos pendentes")).toBeDefined();
});

test("marking another demand as Agora swaps the blocks", async () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Definir checkout" }));
  fireEvent.click(screen.getByRole("button", { name: "Marcar como Agora" }));
  fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  // fechar volta no histórico, e o navegador avisa depois
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  const nowSection = screen.getByRole("region", { name: "Agora" });
  expect(within(nowSection).getByText("Definir checkout")).toBeDefined();
  const list = screen.getByRole("list", { name: "Em andamento" });
  expect(within(list).getByText("Revisar textos")).toBeDefined();
});

test("nothing in progress shows the empty state", () => {
  render(<ResumeBoard demands={[]} projects={projects} now={now} />);
  expect(screen.getByText("Nada em andamento agora.")).toBeDefined();
});
