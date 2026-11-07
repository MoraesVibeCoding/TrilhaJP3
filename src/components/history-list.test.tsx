import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { HistoryList } from "./demand-detail";

afterEach(cleanup);

const now = new Date(2026, 10, 5, 16, 0);
const at = (d: number, h: number) => new Date(2026, 10, d, h, 0).toISOString();
const history = [
  {
    id: 4,
    at: at(5, 15),
    author: "pedro",
    mine: true,
    text: "Estado: A fazer → Fazendo",
  },
  { id: 3, at: at(5, 9), author: "ana", mine: false, text: "Comentou" },
  {
    id: 2,
    at: at(4, 17),
    author: "pedro",
    mine: true,
    text: "Concluiu a subtarefa Home",
  },
  {
    id: 1,
    at: new Date(2026, 9, 30, 9, 0).toISOString(),
    author: "Sistema",
    mine: false,
    text: "Criou a demanda",
  },
];

test("agrupa por dia, do mais novo ao mais antigo, com a hora, o autor e o texto", () => {
  render(<HistoryList history={history} now={now} />);
  const days = screen.getAllByRole("heading", { level: 3 });
  expect(days.map((d) => d.textContent)).toEqual([
    "hoje",
    "ontem",
    "30 de out.",
  ]);
  const [today, yesterday, older] = screen.getAllByRole("list");
  const items = within(today).getAllByRole("listitem");
  expect(items).toHaveLength(2);
  expect(items[0].textContent).toBe("15hVocêEstado: A fazer → Fazendo");
  expect(items[1].textContent).toBe("9hanaComentou");
  expect(within(yesterday).getByRole("listitem").textContent).toBe(
    "17hVocêConcluiu a subtarefa Home",
  );
  expect(within(older).getByRole("listitem").textContent).toBe(
    "9hSistemaCriou a demanda",
  );
  expect(items[0].querySelector("time")?.getAttribute("dateTime")).toBe(
    at(5, 15),
  );
});

test("sem eventos, diz que não há alterações", () => {
  render(<HistoryList history={[]} now={now} />);
  expect(screen.getByText("Sem alterações.")).toBeDefined();
  expect(screen.queryByRole("list")).toBeNull();
});
