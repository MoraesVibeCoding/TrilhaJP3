import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

const importDemands = vi.hoisted(() => vi.fn());
vi.mock("@/app/(app)/demandas/actions", () => ({ importDemands }));

const { ImportCaptured } = await import("./import-captured");

const KEY = "import-test";
const made = (id: string, title: string, priority = "Média") => ({
  id,
  title,
  projectId: "p1",
  priority,
  state: "A fazer",
  lastActivityAt: "2026-10-23T12:00:00.000Z",
});
const projects = [
  { id: "11111111-2222-4333-8444-555555555555", name: "Site" },
  { id: "66666666-7777-4888-9999-000000000000", name: "App" },
];
const stored = () =>
  (JSON.parse(localStorage.getItem(KEY) ?? "[]") as { id: string }[]).map(
    (d) => d.id,
  );

beforeEach(() => {
  importDemands.mockReset().mockResolvedValue({ ok: true, count: 1 });
  localStorage.setItem(
    KEY,
    JSON.stringify([
      made("c-1", "Ajustar menu", "Alta"),
      made("c-2", "Revisar contrato"),
      made("c-3", "teste"),
    ]),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const setup = () =>
  render(<ImportCaptured projects={projects} storageKey={KEY} />);
const region = () =>
  screen.getByRole("region", { name: /capturadas só neste navegador/ });

test("nothing captured, nothing shown", () => {
  localStorage.clear();
  setup();
  expect(screen.queryByRole("region")).toBeNull();
});

test("lists every captured demand, all marked, and counts them", () => {
  setup();
  expect(within(region()).getAllByRole("checkbox")).toHaveLength(3);
  expect(
    within(region())
      .getAllByRole("checkbox")
      .every((c) => (c as HTMLInputElement).checked),
  ).toBe(true);
  expect(
    within(region()).getByRole("button", { name: "Importar 3 demandas" }),
  ).toBeDefined();
});

test("imports only the marked ones into the chosen project and forgets them", async () => {
  setup();
  fireEvent.click(within(region()).getByRole("checkbox", { name: "teste" }));
  fireEvent.change(within(region()).getByLabelText("Projeto"), {
    target: { value: projects[1].id },
  });
  fireEvent.click(
    within(region()).getByRole("button", { name: "Importar 2 demandas" }),
  );
  expect(
    await screen.findByText("2 demandas importadas para App."),
  ).toBeDefined();
  expect(importDemands).toHaveBeenCalledWith({
    projectId: projects[1].id,
    items: [
      { title: "Ajustar menu", priority: "Alta" },
      { title: "Revisar contrato", priority: "Média" },
    ],
  });
  expect(stored()).toEqual(["c-3"]);
});

test("a failed import keeps everything and says so", async () => {
  importDemands.mockResolvedValue({
    ok: false,
    error: "Não foi possível importar. Tente de novo.",
  });
  setup();
  fireEvent.click(
    within(region()).getByRole("button", { name: "Importar 3 demandas" }),
  );
  expect((await screen.findByRole("alert")).textContent).toBe(
    "Não foi possível importar. Tente de novo.",
  );
  expect(stored()).toEqual(["c-1", "c-2", "c-3"]);
});

test("Descartar as desmarcadas drops only those, without the database", () => {
  setup();
  fireEvent.click(within(region()).getByRole("checkbox", { name: "teste" }));
  fireEvent.click(
    within(region()).getByRole("button", { name: "Descartar as desmarcadas" }),
  );
  expect(stored()).toEqual(["c-1", "c-2"]);
  expect(importDemands).not.toHaveBeenCalled();
});

test("with nothing marked, importing is off", () => {
  setup();
  for (const box of within(region()).getAllByRole("checkbox"))
    fireEvent.click(box);
  expect(
    (
      within(region()).getByRole("button", {
        name: "Importar 0 demandas",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});

test("with no project yet, it points to Projetos", () => {
  render(<ImportCaptured projects={[]} storageKey={KEY} />);
  expect(
    within(region())
      .getByRole("link", { name: "Crie o primeiro em Projetos" })
      .getAttribute("href"),
  ).toBe("/projetos");
});
