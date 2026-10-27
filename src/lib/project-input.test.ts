import { describe, expect, test } from "vitest";
import { parseProject } from "./project-input";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};
const valid = {
  name: "Site institucional",
  status: "idea",
  priority: "medium",
};

describe("parseProject", () => {
  test("aceita o mínimo e limpa espaços; descrição e link vazios viram null", () => {
    expect(
      parseProject(
        form({ ...valid, name: "  Site  ", description: " ", link: "" }),
      ),
    ).toEqual({
      ok: true,
      data: {
        name: "Site",
        description: null,
        status: "idea",
        priority: "medium",
        link: null,
      },
    });
  });

  test("aceita todos os campos preenchidos", () => {
    const result = parseProject(
      form({
        ...valid,
        description: "Novo site",
        status: "in_progress",
        priority: "high",
        link: "https://exemplo.com.br/projeto",
      }),
    );
    expect(result.ok && result.data.link).toBe(
      "https://exemplo.com.br/projeto",
    );
  });

  test("erro por campo, em português", () => {
    const result = parseProject(
      form({
        name: " ",
        status: "archived",
        priority: "urgent",
        link: "javascript:alert(1)",
        description: "x".repeat(2001),
      }),
    );
    expect(result).toEqual({
      ok: false,
      errors: {
        name: "Dê um nome ao projeto.",
        description: "Use no máximo 2.000 caracteres.",
        status: "Escolha um estado da lista.",
        priority: "Escolha uma prioridade da lista.",
        link: "Use um endereço que comece com https://.",
      },
    });
  });

  test("recusa http, nome longo e campos ausentes", () => {
    expect(
      parseProject(form({ ...valid, link: "http://x.com" })),
    ).toMatchObject({ ok: false, errors: { link: expect.any(String) } });
    expect(
      parseProject(form({ ...valid, name: "x".repeat(121) })),
    ).toMatchObject({
      ok: false,
      errors: { name: "Use no máximo 120 caracteres." },
    });
    expect(parseProject(form({}))).toMatchObject({ ok: false });
  });
});
