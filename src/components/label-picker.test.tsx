import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

// As ações ficam pendentes até o teste decidir: dá para ver a mudança otimista no meio.
const pending: ((v: unknown) => void)[] = [];
const wait = () => new Promise((resolve) => pending.push(resolve));
const actions = vi.hoisted(() => ({
  applyLabel: vi.fn(),
  removeLabel: vi.fn(),
  setLabelColor: vi.fn(),
}));
vi.mock("@/app/(app)/demandas/actions", () => actions);

const { LabelPicker } = await import("./label-picker");

const all = [
  { id: "l1", name: "Bug", color: "tijolo" },
  { id: "l2", name: "Cliente aguardando", color: "mostarda" },
  { id: "l3", name: "Financeiro", color: "alta" },
] as const;

const settle = (value: unknown) =>
  act(async () => {
    pending.splice(0).forEach((resolve) => resolve(value));
    await new Promise((r) => setTimeout(r, 0));
  });

beforeEach(() => {
  for (const a of Object.values(actions))
    a.mockReset().mockImplementation(wait);
});
afterEach(async () => {
  await settle(true);
  cleanup();
});

const setup = (applied = [all[1]]) => {
  render(<LabelPicker taskId="t1" applied={applied} all={all} />);
  return screen.getByRole("button", { name: "Etiquetas" });
};
const panel = () => screen.getByRole("group", { name: "Etiquetas da empresa" });

test("shows the applied labels by name, or says there are none", () => {
  setup();
  expect(screen.getByText("Cliente aguardando")).toBeDefined();
  cleanup();
  setup([]);
  expect(screen.getByText("Nenhuma")).toBeDefined();
});

test("Etiquetas opens a panel with every company label, the applied ones checked", () => {
  const button = setup();
  expect(button.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(button);
  expect(button.getAttribute("aria-expanded")).toBe("true");
  const boxes = within(panel()).getAllByRole("checkbox");
  expect(boxes.map((b) => b.getAttribute("aria-label"))).toEqual([
    "Bug",
    "Cliente aguardando",
    "Financeiro",
  ]);
  expect(boxes.map((b) => (b as HTMLInputElement).checked)).toEqual([
    false,
    true,
    false,
  ]);
});

test("checking applies the label at once; unchecking takes it off", () => {
  fireEvent.click(setup());
  fireEvent.click(within(panel()).getByRole("checkbox", { name: "Bug" }));
  expect(actions.applyLabel).toHaveBeenCalledWith("t1", "Bug");
  expect(screen.getAllByText("Bug").length).toBeGreaterThan(1);
  fireEvent.click(
    within(panel()).getByRole("checkbox", { name: "Cliente aguardando" }),
  );
  expect(actions.removeLabel).toHaveBeenCalledWith("t1", "l2");
});

test("each label offers the five colors; the current one is pressed", () => {
  fireEvent.click(setup());
  const colors = within(panel()).getByRole("group", { name: "Cor de Bug" });
  const buttons = within(colors).getAllByRole("button");
  expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual([
    "Névoa",
    "Mata",
    "Alta",
    "Mostarda",
    "Tijolo",
  ]);
  expect(
    within(colors)
      .getByRole("button", { name: "Tijolo" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  fireEvent.click(within(colors).getByRole("button", { name: "Mostarda" }));
  expect(actions.setLabelColor).toHaveBeenCalledWith("l1", "mostarda");
  expect(
    within(colors)
      .getByRole("button", { name: "Mostarda" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
});

test("typing filters the list and offers to create a new name; Enter creates it", () => {
  fireEvent.click(setup());
  const field = screen.getByRole("textbox", {
    name: "Buscar ou criar etiqueta",
  });
  expect(document.activeElement).toBe(field);
  fireEvent.change(field, { target: { value: "fin" } });
  expect(within(panel()).getAllByRole("checkbox")).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Criar “fin”" })).toBeDefined();
  fireEvent.change(field, { target: { value: "  financeiro " } });
  expect(screen.queryByRole("button", { name: /Criar/ })).toBeNull();
  fireEvent.change(field, { target: { value: "Urgente" } });
  fireEvent.keyDown(field, { key: "Enter" });
  expect(actions.applyLabel).toHaveBeenCalledWith("t1", "Urgente");
  expect((field as HTMLInputElement).value).toBe("");
});

test("Esc closes the panel, returns focus and does not reach the window", () => {
  const button = setup();
  fireEvent.click(button);
  const reached = fireEvent.keyDown(
    screen.getByRole("textbox", { name: "Buscar ou criar etiqueta" }),
    { key: "Escape" },
  );
  expect(reached).toBe(false);
  expect(button.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(button);
});

test("a save that fails goes back and says so", async () => {
  fireEvent.click(setup());
  fireEvent.click(within(panel()).getByRole("checkbox", { name: "Bug" }));
  await settle(null);
  expect(
    (within(panel()).getByRole("checkbox", { name: "Bug" }) as HTMLInputElement)
      .checked,
  ).toBe(false);
  expect(screen.getByRole("alert").textContent).toBe(
    "Não foi possível salvar. Tente de novo.",
  );
});

test("a label still being created cannot be colored or unchecked until it is saved", () => {
  fireEvent.click(setup());
  const field = screen.getByRole("textbox", {
    name: "Buscar ou criar etiqueta",
  });
  fireEvent.change(field, { target: { value: "Urgente" } });
  fireEvent.keyDown(field, { key: "Enter" });
  const colors = within(panel()).getByRole("group", { name: "Cor de Urgente" });
  for (const b of within(colors).getAllByRole("button"))
    expect((b as HTMLButtonElement).disabled).toBe(true);
  expect(
    (
      within(panel()).getByRole("checkbox", {
        name: "Urgente",
      }) as HTMLInputElement
    ).disabled,
  ).toBe(true);
});
