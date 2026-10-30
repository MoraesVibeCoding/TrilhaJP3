import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { DoneToday } from "./done-today";
import type { ResumeItem } from "@/lib/resume";

afterEach(cleanup);

const done = (id: string, title: string): ResumeItem => ({
  id,
  title,
  projectName: "App",
  lastActivityAt: new Date(2026, 9, 22, 11, 0).toISOString(),
  nextSubtask: null,
  nextStepNumber: null,
  subtasksDone: 0,
  subtasksTotal: 0,
});

test("is collapsed by default with the count and lists what was done", () => {
  render(
    <DoneToday
      items={[done("a", "Enviar proposta"), done("b", "Ajustar rodapé")]}
    />,
  );
  const group = screen
    .getByText(
      (_, el) =>
        el?.tagName === "SUMMARY" && el.textContent === "Feito hoje (2)",
    )
    .closest("details")!;
  expect(group.open).toBe(false);
  expect(within(group).getAllByRole("listitem")).toHaveLength(2);
  expect(within(group).getByText("Enviar proposta")).toBeDefined();
});

test("renders nothing when nothing was finished today", () => {
  const { container } = render(<DoneToday items={[]} />);
  expect(container.textContent).toBe("");
});
