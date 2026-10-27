import { describe, expect, test } from "vitest";
import { parseDemand } from "./demand-input";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};
const valid = { title: "Revisar textos", priority: "high" };

describe("parseDemand", () => {
  test("limpa espaços; descrição e prazo vazios viram null", () => {
    expect(
      parseDemand(
        form({
          ...valid,
          title: "  Revisar  ",
          description: " ",
          due_date: "",
        }),
      ),
    ).toEqual({
      ok: true,
      data: {
        title: "Revisar",
        description: null,
        priority: "high",
        due_date: null,
      },
    });
  });

  test("aceita descrição e prazo válidos", () => {
    expect(
      parseDemand(
        form({
          ...valid,
          description: "Com o cliente.",
          due_date: "2026-10-30",
        }),
      ),
    ).toMatchObject({
      ok: true,
      data: { description: "Com o cliente.", due_date: "2026-10-30" },
    });
  });

  test("um erro por campo, em pt-BR", () => {
    expect(
      parseDemand(
        form({
          title: " ",
          priority: "urgent",
          description: "x".repeat(5001),
          due_date: "2026-02-30",
        }),
      ),
    ).toEqual({
      ok: false,
      errors: {
        title: "Dê um título à demanda.",
        priority: "Escolha uma prioridade da lista.",
        description: "Use no máximo 5.000 caracteres.",
        due_date: "Use uma data válida.",
      },
    });
  });

  test("título com mais de 200 caracteres e campos ausentes", () => {
    expect(
      parseDemand(form({ ...valid, title: "x".repeat(201) })),
    ).toMatchObject({
      ok: false,
      errors: { title: "Use no máximo 200 caracteres." },
    });
    expect(parseDemand(form({}))).toMatchObject({ ok: false });
  });
});
