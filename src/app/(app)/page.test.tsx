import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import Page from "./page";
import { demoDemands } from "@/lib/demo-data";

afterEach(cleanup);

test("home is Retomar", () => {
  render(<Page />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Retomar" }),
  ).toBeDefined();
});

test("offers a shortcut to all demands", () => {
  render(<Page />);
  expect(
    screen
      .getByRole("link", { name: "Todas as demandas" })
      .getAttribute("href"),
  ).toBe("/demandas");
});

test("labels the content as demonstration data", () => {
  render(<Page />);
  expect(screen.getByRole("note").textContent).toContain(
    "Dados de demonstração",
  );
});

test("leads with Agora, then the rest in progress, then Feito hoje", () => {
  render(<Page />);
  const nowSection = screen.getByRole("region", { name: "Agora" });
  expect(
    within(nowSection).getByText("Revisar textos da página inicial"),
  ).toBeDefined();
  const rows = within(
    screen.getByRole("list", { name: "Em andamento" }),
  ).getAllByRole("listitem");
  expect(rows).toHaveLength(
    demoDemands.filter((d) => d.state === "Fazendo").length - 1,
  );
  expect(
    screen.getByText("Feito hoje (2)", { selector: "summary" }),
  ).toBeDefined();
});
