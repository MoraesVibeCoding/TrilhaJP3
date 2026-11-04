import { beforeEach, describe, expect, test, vi } from "vitest";

// Cada consulta grava a cadeia de chamadas e devolve o próximo resultado da fila.
const db = vi.hoisted(() => ({
  queries: [] as string[][],
  results: [] as { data?: unknown; error?: object | null }[],
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  getCurrentUser: async () => ({ id: "u1", organizationId: "org-1" }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => {
      const calls = [`from(${table})`];
      db.queries.push(calls);
      const chain: object = new Proxy(
        {},
        {
          get: (_target, method: string) =>
            method === "then"
              ? (resolve: (v: unknown) => void) =>
                  resolve({ data: null, error: null, ...db.results.shift() })
              : (...args: unknown[]) => {
                  calls.push(
                    `${method}(${args.map((a) => JSON.stringify(a)).join(",")})`,
                  );
                  return chain;
                },
        },
      );
      return chain;
    },
  }),
}));

const {
  moveDemand,
  concludeStep,
  setNow,
  createDemand,
  captureOptions,
  updateDemand,
  importDemands,
  addSubtask,
  renameSubtask,
  toggleSubtask,
  archiveSubtask,
  applyLabel,
  removeLabel,
  setLabelColor,
  addComment,
  archiveComment,
} = await import("./actions");
const { revalidatePath } = await import("next/cache");

const ID = "7d3c6a8e-1f2b-4c5d-9e0f-112233445566";
const STEP = "11111111-2222-4333-8444-555555555555";

beforeEach(() => {
  db.queries = [];
  db.results = [];
  vi.mocked(revalidatePath).mockClear();
});

describe("moveDemand", () => {
  test("grava o estado e atualiza as telas", async () => {
    db.results = [{ data: [{ id: ID }] }];
    await expect(moveDemand(ID, "done")).resolves.toBe(true);
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `update({"state":"done"})`,
        `eq("id","${ID}")`,
        `select("id")`,
      ],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  test("recusa estado ou id inválidos sem tocar no banco", async () => {
    await expect(moveDemand(ID, "blocked")).resolves.toBe(false);
    await expect(moveDemand("d1", "done")).resolves.toBe(false);
    expect(db.queries).toEqual([]);
  });

  test("nenhuma linha (outra empresa) ou erro do banco = falhou", async () => {
    db.results = [{ data: [] }, { error: { message: "x" } }];
    await expect(moveDemand(ID, "doing")).resolves.toBe(false);
    await expect(moveDemand(ID, "doing")).resolves.toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("concludeStep", () => {
  test("conclui a primeira subtarefa aberta, na ordem de criação", async () => {
    db.results = [{ data: [{ id: STEP }] }, { data: [{ id: STEP }] }];
    await expect(concludeStep(ID)).resolves.toBe(true);
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `select("id")`,
        `eq("parent_task_id","${ID}")`,
        `neq("state","done")`,
        `is("archived_at",null)`,
        `order("created_at")`,
        "limit(1)",
      ],
      [
        "from(tasks)",
        `update({"state":"done"})`,
        `eq("id","${STEP}")`,
        `select("id")`,
      ],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  test("sem passo aberto, nada muda", async () => {
    db.results = [{ data: [] }];
    await expect(concludeStep(ID)).resolves.toBe(false);
    expect(db.queries).toHaveLength(1);
  });
});

describe("setNow", () => {
  test("marcar tira a Agora anterior da empresa antes de marcar esta", async () => {
    db.results = [{}, { data: [{ id: ID }] }];
    await expect(setNow(ID, true)).resolves.toBe(true);
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `update({"is_now":false})`,
        `eq("organization_id","org-1")`,
        `eq("is_now",true)`,
        `neq("id","${ID}")`,
      ],
      [
        "from(tasks)",
        `update({"is_now":true})`,
        `eq("id","${ID}")`,
        `select("id")`,
      ],
    ]);
  });

  test("desmarcar só mexe nesta", async () => {
    db.results = [{ data: [{ id: ID }] }];
    await expect(setNow(ID, false)).resolves.toBe(true);
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `update({"is_now":false})`,
        `eq("id","${ID}")`,
        `select("id")`,
      ],
    ]);
  });

  test("falha ao tirar a anterior não marca a nova", async () => {
    db.results = [{ error: { message: "x" } }];
    await expect(setNow(ID, true)).resolves.toBe(false);
    expect(db.queries).toHaveLength(1);
  });
});

describe("createDemand", () => {
  const input = {
    title: "  Revisar   rodapé ",
    projectId: ID,
    priority: "Alta",
  };

  test("grava em A fazer, na empresa do usuário logado, com o título limpo", async () => {
    await expect(createDemand(input)).resolves.toEqual({ ok: true });
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `insert({"organization_id":"org-1","project_id":"${ID}","title":"Revisar rodapé","priority":"high","state":"todo"})`,
      ],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  test("título vazio, projeto ou prioridade inválidos não chegam ao banco", async () => {
    await expect(createDemand({ ...input, title: " " })).resolves.toEqual({
      ok: false,
      error: "Escreva o título da demanda.",
    });
    for (const bad of [
      { ...input, projectId: "p1" },
      { ...input, priority: "Urgente" },
    ])
      await expect(createDemand(bad)).resolves.toEqual({
        ok: false,
        error: "Não foi possível criar. Tente de novo.",
      });
    expect(db.queries).toEqual([]);
  });

  test("erro do banco (projeto de outra empresa, por exemplo) não vira sucesso", async () => {
    db.results = [{ error: { code: "23503" } }];
    await expect(createDemand(input)).resolves.toEqual({
      ok: false,
      error: "Não foi possível criar. Tente de novo.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("captureOptions", () => {
  test("devolve os projetos ativos e os títulos das demandas ativas", async () => {
    db.results = [
      { data: [{ id: ID, name: "Site" }] },
      { data: [{ id: STEP, title: "Revisar textos" }] },
    ];
    await expect(captureOptions()).resolves.toEqual({
      projects: [{ id: ID, name: "Site" }],
      demands: [{ id: STEP, title: "Revisar textos" }],
    });
    expect(db.queries).toEqual([
      [
        "from(projects)",
        `select("id, name")`,
        `is("archived_at",null)`,
        `order("name")`,
      ],
      [
        "from(tasks)",
        `select("id, title")`,
        `is("archived_at",null)`,
        `is("parent_task_id",null)`,
      ],
    ]);
  });

  test("erro do banco = nenhuma opção, e a janela diz que não carregou", async () => {
    db.results = [{ error: { message: "x" } }, {}];
    await expect(captureOptions()).resolves.toBeNull();
  });
});

describe("updateDemand", () => {
  const form = (fields: Record<string, string>) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    return data;
  };
  const valid = {
    id: ID,
    title: "Revisar",
    priority: "low",
    due_date: "2026-10-30",
  };

  test("grava título, descrição, prioridade e prazo, e atualiza as telas", async () => {
    db.results = [{ data: [{ id: ID }] }];
    await expect(updateDemand(undefined, form(valid))).resolves.toEqual({
      saved: true,
    });
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `update({"title":"Revisar","description":null,"priority":"low","due_date":"2026-10-30"})`,
        `eq("id","${ID}")`,
        `select("id")`,
      ],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  test("entrada inválida volta os erros e os valores digitados, sem gravar", async () => {
    const state = await updateDemand(undefined, form({ ...valid, title: "" }));
    expect(state).toEqual({
      errors: { title: "Dê um título à demanda." },
      values: {
        title: "",
        description: "",
        priority: "low",
        due_date: "2026-10-30",
      },
    });
    expect(db.queries).toEqual([]);
  });

  test("id inválido ou nenhuma linha (outra empresa) = não encontrada", async () => {
    await expect(
      updateDemand(undefined, form({ ...valid, id: "d1" })),
    ).resolves.toEqual({ errors: { form: "Demanda não encontrada." } });
    db.results = [{ data: [] }];
    await expect(updateDemand(undefined, form(valid))).resolves.toEqual({
      errors: { form: "Demanda não encontrada." },
    });
  });

  test("erro do banco mantém os valores e avisa", async () => {
    db.results = [{ error: { message: "x" } }];
    await expect(updateDemand(undefined, form(valid))).resolves.toMatchObject({
      errors: { form: "Não foi possível salvar. Tente de novo." },
      values: { title: "Revisar" },
    });
  });
});

describe("importDemands", () => {
  const items = [
    { title: " Ajustar menu ", priority: "Alta" },
    { title: "Revisar contrato", priority: "Média" },
  ];

  test("grava as marcadas no projeto escolhido, em A fazer, na empresa do usuário", async () => {
    await expect(importDemands({ projectId: ID, items })).resolves.toEqual({
      ok: true,
      count: 2,
    });
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `insert([{"organization_id":"org-1","project_id":"${ID}","title":"Ajustar menu","priority":"high","state":"todo"},{"organization_id":"org-1","project_id":"${ID}","title":"Revisar contrato","priority":"medium","state":"todo"}])`,
      ],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  test("lista vazia, projeto inválido ou item inválido não chegam ao banco", async () => {
    for (const input of [
      { projectId: ID, items: [] },
      { projectId: "p1", items },
      { projectId: ID, items: [{ title: " ", priority: "Alta" }] },
      { projectId: ID, items: [{ title: "Ok", priority: "Urgente" }] },
      { projectId: ID, items: Array(501).fill(items[0]) },
    ])
      await expect(importDemands(input)).resolves.toEqual({
        ok: false,
        error: "Não foi possível importar. Tente de novo.",
      });
    expect(db.queries).toEqual([]);
  });

  test("erro do banco não vira sucesso", async () => {
    db.results = [{ error: { code: "23503" } }];
    await expect(importDemands({ projectId: ID, items })).resolves.toEqual({
      ok: false,
      error: "Não foi possível importar. Tente de novo.",
    });
  });
});

describe("subtarefas (T7)", () => {
  test("addSubtask lê o projeto da mãe de primeiro nível e cria a filha no fim", async () => {
    db.results = [{ data: { project_id: "p1" } }, {}];
    await expect(addSubtask(ID, "  Revisar textos  ")).resolves.toBe(true);
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `select("project_id")`,
        `eq("id","${ID}")`,
        `is("parent_task_id",null)`,
        `is("archived_at",null)`,
        "single()",
      ],
      [
        "from(tasks)",
        `insert({"organization_id":"org-1","project_id":"p1","parent_task_id":"${ID}","title":"Revisar textos","state":"todo"})`,
      ],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  test("addSubtask recusa título vazio e id inválido sem consultar o banco", async () => {
    await expect(addSubtask(ID, "   ")).resolves.toBe(false);
    await expect(addSubtask("x", "Passo")).resolves.toBe(false);
    expect(db.queries).toEqual([]);
  });

  test("addSubtask devolve false quando a mãe não serve ou a gravação falha", async () => {
    db.results = [{ error: { code: "PGRST116" } }];
    await expect(addSubtask(ID, "Passo")).resolves.toBe(false);
    db.results = [{ data: { project_id: "p1" } }, { error: { code: "23514" } }];
    await expect(addSubtask(ID, "Passo")).resolves.toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("renameSubtask, toggleSubtask e archiveSubtask só alteram subtarefas", async () => {
    db.results = [
      { data: [{ id: STEP }] },
      { data: [{ id: STEP }] },
      { data: [{ id: STEP }] },
    ];
    await expect(renameSubtask(STEP, " Contato ")).resolves.toBe(true);
    await expect(toggleSubtask(STEP, false)).resolves.toBe(true);
    await expect(archiveSubtask(STEP)).resolves.toBe(true);
    const only = [
      `eq("id","${STEP}")`,
      `not("parent_task_id","is",null)`,
      `select("id")`,
    ];
    expect(db.queries[0]).toEqual([
      "from(tasks)",
      `update({"title":"Contato"})`,
      ...only,
    ]);
    expect(db.queries[1]).toEqual([
      "from(tasks)",
      `update({"state":"todo"})`,
      ...only,
    ]);
    expect(db.queries[2][1]).toMatch(
      /^update\(\{"archived_at":"\d{4}-\d\d-\d\dT/,
    );
    expect(db.queries[2].slice(2)).toEqual(only);
  });

  test("toggleSubtask marca como feita", async () => {
    db.results = [{ data: [{ id: STEP }] }];
    await expect(toggleSubtask(STEP, true)).resolves.toBe(true);
    expect(db.queries[0][1]).toBe(`update({"state":"done"})`);
  });

  test("entradas inválidas não chegam ao banco; nenhuma linha alterada é false", async () => {
    await expect(renameSubtask(STEP, "")).resolves.toBe(false);
    await expect(renameSubtask("x", "Ok")).resolves.toBe(false);
    await expect(
      toggleSubtask(STEP, "sim" as unknown as boolean),
    ).resolves.toBe(false);
    await expect(archiveSubtask("x")).resolves.toBe(false);
    expect(db.queries).toEqual([]);
    db.results = [{ data: [] }];
    await expect(archiveSubtask(STEP)).resolves.toBe(false);
  });
});

describe("etiquetas (T8)", () => {
  const LABEL = "22222222-3333-4444-8555-666666666666";

  test("applyLabel reaproveita a etiqueta de mesmo nome e aplica na demanda", async () => {
    db.results = [{ data: [{ id: LABEL, name: "Bug", color: "tijolo" }] }, {}];
    await expect(applyLabel(ID, "  bug ")).resolves.toEqual({
      id: LABEL,
      name: "Bug",
      color: "tijolo",
    });
    expect(db.queries).toEqual([
      ["from(labels)", `select("id, name, color")`],
      [
        "from(task_labels)",
        `insert({"organization_id":"org-1","task_id":"${ID}","label_id":"${LABEL}"})`,
      ],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  test("applyLabel cria a etiqueta em Névoa quando o nome é novo", async () => {
    db.results = [
      { data: [] },
      { data: { id: LABEL, name: "Cliente aguardando", color: "nevoa" } },
      {},
    ];
    await expect(applyLabel(ID, "Cliente   aguardando")).resolves.toMatchObject(
      {
        id: LABEL,
        color: "nevoa",
      },
    );
    expect(db.queries[1]).toEqual([
      "from(labels)",
      `insert({"organization_id":"org-1","name":"Cliente aguardando"})`,
      `select("id, name, color")`,
      "single()",
    ]);
  });

  test("applyLabel trata a etiqueta já aplicada como sucesso", async () => {
    db.results = [
      { data: [{ id: LABEL, name: "Bug", color: "tijolo" }] },
      { error: { code: "23505" } },
    ];
    await expect(applyLabel(ID, "Bug")).resolves.toMatchObject({ id: LABEL });
  });

  test("applyLabel recusa nome inválido e devolve null quando o banco recusa", async () => {
    await expect(applyLabel(ID, "   ")).resolves.toBeNull();
    await expect(applyLabel("x", "Bug")).resolves.toBeNull();
    expect(db.queries).toEqual([]);
    db.results = [
      { data: [{ id: LABEL, name: "Bug", color: "tijolo" }] },
      { error: { code: "23514" } },
    ];
    await expect(applyLabel(ID, "Bug")).resolves.toBeNull();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("removeLabel tira só aquela etiqueta daquela demanda", async () => {
    db.results = [{ data: [{ label_id: LABEL }] }];
    await expect(removeLabel(ID, LABEL)).resolves.toBe(true);
    expect(db.queries[0]).toEqual([
      "from(task_labels)",
      "delete()",
      `eq("task_id","${ID}")`,
      `eq("label_id","${LABEL}")`,
      `select("label_id")`,
    ]);
    db.results = [{ data: [] }];
    await expect(removeLabel(ID, LABEL)).resolves.toBe(false);
  });

  test("setLabelColor aceita só a paleta", async () => {
    await expect(setLabelColor(LABEL, "azul")).resolves.toBe(false);
    expect(db.queries).toEqual([]);
    db.results = [{ data: [{ id: LABEL }] }];
    await expect(setLabelColor(LABEL, "mostarda")).resolves.toBe(true);
    expect(db.queries[0]).toEqual([
      "from(labels)",
      `update({"color":"mostarda"})`,
      `eq("id","${LABEL}")`,
      `select("id")`,
    ]);
  });
});

describe("comentários (T9)", () => {
  const COMMENT = "33333333-4444-4555-8666-777777777777";

  test("addComment grava o texto sem os espaços das pontas; o autor fica com o banco", async () => {
    db.results = [{}];
    await expect(
      addComment(ID, "  Falta o rodapé.\nE o mapa.  "),
    ).resolves.toBe(true);
    expect(db.queries).toEqual([
      [
        "from(task_comments)",
        `insert({"organization_id":"org-1","task_id":"${ID}","body":"Falta o rodapé.\\nE o mapa."})`,
      ],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  test("addComment recusa texto vazio, longo demais e id inválido sem consultar o banco", async () => {
    await expect(addComment(ID, "   ")).resolves.toBe(false);
    await expect(addComment(ID, "x".repeat(5001))).resolves.toBe(false);
    await expect(addComment("x", "Oi")).resolves.toBe(false);
    expect(db.queries).toEqual([]);
    db.results = [{ error: { code: "42501" } }];
    await expect(addComment(ID, "Oi")).resolves.toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("archiveComment arquiva; sem linha alterada (outro autor) é false", async () => {
    db.results = [{ data: [{ id: COMMENT }] }];
    await expect(archiveComment(COMMENT)).resolves.toBe(true);
    expect(db.queries[0][0]).toBe("from(task_comments)");
    expect(db.queries[0][1]).toMatch(/^update\(\{"archived_at":"\d{4}-/);
    expect(db.queries[0].slice(2)).toEqual([
      `eq("id","${COMMENT}")`,
      `select("id")`,
    ]);
    db.results = [{ data: [] }];
    await expect(archiveComment(COMMENT)).resolves.toBe(false);
    await expect(archiveComment("x")).resolves.toBe(false);
  });
});
