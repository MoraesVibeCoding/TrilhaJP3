import { afterEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { DemandsBoard, type DemandsDemand } from "./demands-board";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const projects = [
  { id: "p1", name: "Site" },
  { id: "p2", name: "App" },
];
const now = new Date(2026, 9, 22, 15, 0);

const d = (over: Partial<DemandsDemand>): DemandsDemand => ({
  id: "x",
  projectId: "p1",
  title: "T",
  state: "Fazendo",
  priority: "Média",
  lastActivityAt: "2026-10-20T10:00:00",
  subtasks: [],
  comments: [],
  attachments: [],
  history: [],
  ...over,
});

const demands: DemandsDemand[] = [
  d({
    id: "a",
    title: "Banner",
    state: "A fazer",
    priority: "Baixa",
    lastActivityAt: "2026-10-18T10:00:00",
  }),
  d({
    id: "b",
    title: "Checkout",
    projectId: "p2",
    priority: "Alta",
    lastActivityAt: "2026-10-21T10:00:00",
    subtasks: [
      { title: "Fluxo", done: true },
      { title: "Pagamento", done: false },
    ],
  }),
  d({
    id: "c",
    title: "Agenda",
    projectId: "p2",
    state: "Feito",
    priority: "Alta",
    lastActivityAt: "2026-10-22T10:00:00",
  }),
  d({
    id: "e",
    title: "Contato",
    priority: "Média",
    lastActivityAt: "2026-10-19T10:00:00",
  }),
];

let n = 0;
const setup = (list = demands) =>
  render(
    <DemandsBoard
      demands={list}
      projects={projects}
      now={now}
      storageName={`test-${n++}`}
    />,
  );
const table = () => screen.getByRole("table", { name: "Demandas" });
const bodyTitles = () =>
  within(table())
    .getAllByRole("row")
    .slice(1)
    .map((r) => within(r).getAllByRole("cell")[0]?.textContent);

test("Tabela is the current view and the three views are real buttons", () => {
  setup();
  const nav = screen.getByRole("group", { name: "Visões" });
  expect(
    within(nav)
      .getByRole("button", { name: "Tabela" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(within(nav).getByRole("button", { name: "Quadro" })).toBeDefined();
  expect(within(nav).queryByText("em breve")).toBeNull();
});

test("starts sorted by priority (Alta first) and says so", () => {
  setup();
  expect(bodyTitles()).toEqual(["Checkout", "Agenda", "Contato", "Banner"]);
  const th = within(table()).getByRole("columnheader", { name: /Prioridade/ });
  expect(th.getAttribute("aria-sort")).toBe("descending");
});

test("clicking a header sorts by it and clicking again reverses", () => {
  setup();
  fireEvent.click(within(table()).getByRole("button", { name: "Demanda" }));
  expect(bodyTitles()).toEqual(["Agenda", "Banner", "Checkout", "Contato"]);
  expect(
    within(table())
      .getByRole("columnheader", { name: /Demanda/ })
      .getAttribute("aria-sort"),
  ).toBe("ascending");
  fireEvent.click(within(table()).getByRole("button", { name: "Demanda" }));
  expect(bodyTitles()).toEqual(["Contato", "Checkout", "Banner", "Agenda"]);
});

test("filters by project, state (count strip) and priority and shows the count", () => {
  setup();
  fireEvent.change(screen.getByLabelText("Projeto"), {
    target: { value: "p2" },
  });
  expect(bodyTitles()).toEqual(["Checkout", "Agenda"]);
  expect(screen.getByText("Mostrando 2 de 4")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: /Feito/ }));
  expect(bodyTitles()).toEqual(["Agenda"]);
  fireEvent.change(screen.getByLabelText("Prioridade"), {
    target: { value: "Baixa" },
  });
  expect(screen.getByText("Nenhuma demanda com esses filtros.")).toBeDefined();
});

test("the count strip shows how many demands each state has", () => {
  setup();
  const strip = screen.getByRole("group", { name: "Filtrar por estado" });
  expect(
    within(strip).getByRole("button", { name: "1 A fazer" }),
  ).toBeDefined();
  expect(
    within(strip).getByRole("button", { name: "2 Fazendo" }),
  ).toBeDefined();
  expect(within(strip).getByRole("button", { name: "1 Feito" })).toBeDefined();
});

test("counts follow the project and priority filters", () => {
  setup();
  fireEvent.change(screen.getByLabelText("Projeto"), {
    target: { value: "p2" },
  });
  const strip = screen.getByRole("group", { name: "Filtrar por estado" });
  expect(
    within(strip).getByRole("button", { name: "0 A fazer" }),
  ).toBeDefined();
  expect(
    within(strip).getByRole("button", { name: "1 Fazendo" }),
  ).toBeDefined();
});

test("a state button is pressed while it filters and clicking it again clears it", () => {
  setup();
  const fazendo = () => screen.getByRole("button", { name: /Fazendo/ });
  expect(fazendo().getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(fazendo());
  expect(fazendo().getAttribute("aria-pressed")).toBe("true");
  expect(bodyTitles()).toEqual(["Checkout", "Contato"]);
  fireEvent.click(fazendo());
  expect(fazendo().getAttribute("aria-pressed")).toBe("false");
  expect(bodyTitles()).toHaveLength(4);
});

test("Limpar filtros restores everything", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: /Feito/ }));
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  expect(bodyTitles()).toHaveLength(4);
  expect(screen.getByText("Mostrando 4 de 4")).toBeDefined();
});

test("renders the same demands as cards for narrow screens", () => {
  setup();
  const cards = screen.getByRole("list", { name: "Demandas em cartões" });
  expect(within(cards).getAllByRole("listitem")).toHaveLength(4);
  expect(within(cards).getByText("Próxima: Pagamento")).toBeDefined();
});

test("opening a demand shows the window; Concluir passo updates the table", () => {
  setup();
  fireEvent.click(within(table()).getByRole("button", { name: "Checkout" }));
  const dialog = screen.getByRole("dialog", { name: "Checkout" });
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Concluir passo" }),
  );
  fireEvent.click(within(dialog).getByRole("button", { name: "Fechar" }));
  const row = within(table())
    .getByRole("button", { name: "Checkout" })
    .closest("tr")!;
  expect(row.textContent).toContain("2 de 2");
});

test("remembers filter and sort between visits", () => {
  const key = "remember-test";
  const props = { demands, projects, now, storageName: key };
  const first = render(<DemandsBoard {...props} />);
  fireEvent.click(screen.getByRole("button", { name: /Feito/ }));
  first.unmount();
  render(<DemandsBoard {...props} />);
  expect(
    screen.getByRole("button", { name: /Feito/ }).getAttribute("aria-pressed"),
  ).toBe("true");
});

test("with more than 5 rows it tells what Foco hides", () => {
  const many = Array.from({ length: 7 }, (_, i) =>
    d({ id: `m${i}`, title: `Demanda ${i}` }),
  );
  setup(many);
  expect(screen.getByText(/Mostrando as 5 primeiras de 7/)).toBeDefined();
});

test("tampered stored values fall back to the defaults instead of breaking", () => {
  const key = "tampered-test";
  localStorage.setItem(
    key,
    JSON.stringify({
      state: "<b>x</b>",
      priority: 7,
      sortKey: "hack",
      sortDir: "x",
    }),
  );
  render(
    <DemandsBoard
      demands={demands}
      projects={projects}
      now={now}
      storageName={key}
    />,
  );
  expect(bodyTitles()).toEqual(["Checkout", "Agenda", "Contato", "Banner"]);
  expect(
    screen.getByRole("button", { name: /Feito/ }).getAttribute("aria-pressed"),
  ).toBe("false");
});

test("a sort select (for cards on narrow screens) drives the same order", () => {
  setup();
  fireEvent.change(screen.getByLabelText("Ordenar por"), {
    target: { value: "title:asc" },
  });
  expect(bodyTitles()).toEqual(["Agenda", "Banner", "Checkout", "Contato"]);
  const th = within(table()).getByRole("columnheader", { name: /Demanda/ });
  expect(th.getAttribute("aria-sort")).toBe("ascending");
});

test("with no demands at all it is a first-use state, not a filter dead end", () => {
  setup([]);
  expect(screen.getByText("Nenhuma demanda ainda.")).toBeDefined();
  expect(screen.queryByText("Nenhuma demanda com esses filtros.")).toBeNull();
  expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
});

const byProject = () =>
  fireEvent.click(screen.getByRole("button", { name: "Por projeto" }));
const counted = (el: HTMLElement, text: string) =>
  within(el).getByText(
    (_, n) => n?.tagName === "SPAN" && n.textContent === text,
  );
const card = (name: string) =>
  screen.getByRole("heading", { name }).closest("li") as HTMLElement;

test("Por projeto swaps the table for one card per project", () => {
  setup();
  byProject();
  expect(
    screen
      .getByRole("button", { name: "Por projeto" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(screen.queryByRole("table", { name: "Demandas" })).toBeNull();
  const list = screen.getByRole("list", { name: "Projetos" });
  expect(
    within(list)
      .getAllByRole("heading")
      .map((h) => h.textContent),
  ).toEqual(["Site", "App"]);
});

test("a project card shows its counts and progress in words", () => {
  setup();
  byProject();
  const site = card("Site");
  expect(counted(site, "1 Fazendo")).toBeDefined();
  expect(counted(site, "1 A fazer")).toBeDefined();
  expect(within(card("App")).getByText("1 de 2 demandas feitas")).toBeDefined();
});

test("a card shows two demands and expands the rest with Ver mais", () => {
  const many = ["a", "b", "c", "d"].map((id) =>
    d({ id, title: `Demanda ${id}` }),
  );
  setup(many);
  byProject();
  const site = card("Site");
  expect(
    within(site).getAllByRole("button", { name: /^Demanda/ }),
  ).toHaveLength(2);
  const more = within(site).getByRole("button", {
    name: "Ver mais 2 demandas de Site",
  });
  expect(more.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(more);
  expect(
    within(site).getAllByRole("button", { name: /^Demanda/ }),
  ).toHaveLength(4);
  expect(
    within(site)
      .getByRole("button", { name: "Ver menos demandas de Site" })
      .getAttribute("aria-expanded"),
  ).toBe("true");
});

test("the state strip and filters still apply in Por projeto", () => {
  setup();
  byProject();
  fireEvent.click(screen.getByRole("button", { name: /Feito/ }));
  expect(within(card("App")).getByText("Agenda")).toBeDefined();
  expect(within(card("Site")).queryByText("Contato")).toBeNull();
  expect(
    within(card("Site")).getByText("Nenhuma com esse estado."),
  ).toBeDefined();
});

test("opening a demand from a card shows the window", () => {
  setup();
  byProject();
  fireEvent.click(
    within(card("App")).getByRole("button", { name: "Checkout" }),
  );
  expect(screen.getByRole("dialog", { name: "Checkout" })).toBeDefined();
});

test("remembers the chosen view and ignores a tampered one", () => {
  const key = "layout-test";
  const props = { demands, projects, now, storageName: key };
  const first = render(<DemandsBoard {...props} />);
  byProject();
  first.unmount();
  render(<DemandsBoard {...props} />);
  expect(screen.getByRole("list", { name: "Projetos" })).toBeDefined();
  cleanup();
  const tampered = "layout-tampered-test";
  localStorage.setItem(tampered, JSON.stringify({ layout: "<b>x</b>" }));
  render(<DemandsBoard {...props} storageName={tampered} />);
  expect(screen.getByRole("table", { name: "Demandas" })).toBeDefined();
});

test("the progress line is singular when the project has one demand", () => {
  setup([d({ id: "only", title: "Única", state: "Feito" })]);
  byProject();
  expect(within(card("Site")).getByText("1 de 1 demanda feita")).toBeDefined();
});

const quadro = () =>
  fireEvent.click(screen.getByRole("button", { name: "Quadro" }));
const column = (name: RegExp) =>
  screen.getByRole("heading", { name }).closest("section") as HTMLElement;

test("Quadro shows one column per state with its count", () => {
  setup();
  quadro();
  expect(screen.queryByRole("table", { name: "Demandas" })).toBeNull();
  expect(within(column(/^1 A fazer$/)).getByText("Banner")).toBeDefined();
  expect(within(column(/^2 Fazendo$/)).getByText("Checkout")).toBeDefined();
  expect(within(column(/^1 Feito$/)).getByText("Agenda")).toBeDefined();
});

test("a card shows project and priority", () => {
  setup();
  quadro();
  const card = within(column(/Fazendo/))
    .getByText("Checkout")
    .closest("li") as HTMLElement;
  expect(within(card).getByText("App · Alta")).toBeDefined();
});

test("Mover para moves the card to another column and updates the counts", () => {
  setup();
  quadro();
  fireEvent.change(
    screen.getByRole("combobox", { name: "Mover Checkout para" }),
    {
      target: { value: "Feito" },
    },
  );
  expect(within(column(/^2 Feito$/)).getByText("Checkout")).toBeDefined();
  expect(column(/^1 Fazendo$/)).toBeDefined();
  expect(screen.getByRole("status").textContent).toContain(
    "Checkout movida para Feito",
  );
});

test("the move menu offers only the other two states", () => {
  setup();
  quadro();
  const select = screen.getByRole("combobox", { name: "Mover Checkout para" });
  expect(
    within(select)
      .getAllByRole("option")
      .map((o) => o.textContent),
  ).toEqual(["Mover para…", "A fazer", "Feito"]);
});

test("the project filter applies to the columns; the state strip is gone", () => {
  setup();
  quadro();
  expect(
    screen.queryByRole("group", { name: "Filtrar por estado" }),
  ).toBeNull();
  fireEvent.change(screen.getByLabelText("Projeto"), {
    target: { value: "p2" },
  });
  expect(within(column(/Fazendo/)).queryByText("Contato")).toBeNull();
  expect(within(column(/Fazendo/)).getByText("Checkout")).toBeDefined();
});

test("an empty column says so", () => {
  setup([d({ id: "only", title: "Única", state: "Fazendo" })]);
  quadro();
  expect(
    within(column(/A fazer/)).getByText("Nenhuma demanda em A fazer."),
  ).toBeDefined();
});

test("opening a demand from the Quadro shows the window", () => {
  setup();
  quadro();
  fireEvent.click(
    within(column(/Fazendo/)).getByRole("button", { name: "Checkout" }),
  );
  expect(screen.getByRole("dialog", { name: "Checkout" })).toBeDefined();
});

test("remembers Quadro between visits", () => {
  const key = "quadro-test";
  const props = { demands, projects, now, storageName: key };
  const first = render(<DemandsBoard {...props} />);
  quadro();
  first.unmount();
  render(<DemandsBoard {...props} />);
  expect(
    screen.getByRole("button", { name: "Quadro" }).getAttribute("aria-pressed"),
  ).toBe("true");
});

test("a column with more than 5 cards tells what Foco hides", () => {
  const many = Array.from({ length: 7 }, (_, i) =>
    d({ id: `q${i}`, title: `Demanda ${i}` }),
  );
  setup(many);
  quadro();
  expect(
    within(column(/Fazendo/)).getByText(/Mostrando as 5 primeiras de 7/),
  ).toBeDefined();
});

test("after moving, focus returns to the moved card's menu in its new column", () => {
  setup();
  quadro();
  fireEvent.change(
    screen.getByRole("combobox", { name: "Mover Checkout para" }),
    { target: { value: "Feito" } },
  );
  expect(document.activeElement).toBe(
    screen.getByRole("combobox", { name: "Mover Checkout para" }),
  );
});

test("a tampered menu value is ignored instead of making the card vanish", () => {
  setup();
  quadro();
  const select = screen.getByRole("combobox", {
    name: "Mover Checkout para",
  }) as HTMLSelectElement;
  select.options[1]!.value = "<b>x</b>";
  fireEvent.change(select, { target: { value: "<b>x</b>" } });
  expect(within(column(/Fazendo/)).getByText("Checkout")).toBeDefined();
  expect(screen.getByRole("status").textContent).toBe("");
});

test("the sort control stays visible in Por projeto and Quadro, not only below 60rem", () => {
  setup();
  const field = () =>
    screen.getByLabelText("Ordenar por").closest("label") as HTMLElement;
  expect(field().className).not.toContain("sort-field--always");
  byProject();
  expect(field().className).toContain("sort-field--always");
  quadro();
  expect(field().className).toContain("sort-field--always");
});

test("Por projeto runs the states in the same order as the strip and the Quadro", () => {
  setup();
  byProject();
  const counts = card("Site").querySelector(".project-counts")!;
  expect(counts.textContent).toBe("1 A fazer1 Fazendo0 Feito");
});

test("Por projeto shows the priority and no 'Sem subtarefas' filler", () => {
  setup([d({ id: "only", title: "Única", state: "Feito", priority: "Baixa" })]);
  byProject();
  const site = card("Site");
  expect(within(site).getByText("Baixa")).toBeDefined();
  expect(within(site).queryByText("Sem subtarefas")).toBeNull();
});

test("with more than 5 projects it tells what Foco hides", () => {
  const ps = Array.from({ length: 7 }, (_, i) => ({
    id: `pp${i}`,
    name: `Projeto ${i}`,
  }));
  const ds = ps.map((p) =>
    d({ id: p.id, projectId: p.id, title: `D ${p.id}` }),
  );
  render(
    <DemandsBoard demands={ds} projects={ps} now={now} storageName="many-p" />,
  );
  byProject();
  expect(
    screen.getByText(/Mostrando os 5 primeiros de 7 projetos/),
  ).toBeDefined();
});

test("the move confirmation is visible text, then goes away by itself", () => {
  vi.useFakeTimers();
  try {
    setup();
    quadro();
    fireEvent.change(
      screen.getByRole("combobox", { name: "Mover Checkout para" }),
      { target: { value: "Feito" } },
    );
    const status = screen.getByRole("status");
    expect(status.className).toContain("board-message");
    expect(status.className).not.toContain("visually-hidden");
    expect(status.textContent).toContain("Checkout movida para Feito");
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByRole("status").textContent).toBe("");
  } finally {
    vi.useRealTimers();
  }
});
