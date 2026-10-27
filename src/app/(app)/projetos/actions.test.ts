import { beforeEach, describe, expect, test, vi } from "vitest";

type Call = { op: string; payload?: unknown; id?: unknown };
const db = vi.hoisted(() => ({
  calls: [] as Call[],
  error: null as object | null,
  rows: [{ id: "x" }] as object[],
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  getCurrentUser: async () => ({
    id: "u1",
    email: "pedro@exemplo.com.br",
    organizationId: "org-1",
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      insert: async (payload: unknown) => {
        db.calls.push({ op: "insert", payload });
        return { error: db.error };
      },
      update: (payload: unknown) => ({
        eq: (_col: string, id: unknown) => ({
          select: async () => {
            db.calls.push({ op: "update", payload, id });
            return { data: db.error ? null : db.rows, error: db.error };
          },
        }),
      }),
    }),
  }),
}));

const { createProject, updateProject, setArchived } = await import("./actions");
const { revalidatePath } = await import("next/cache");

const ID = "7d3c6a8e-1f2b-4c5d-9e0f-112233445566";
const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};
const valid = { name: "Site", status: "idea", priority: "medium" };

beforeEach(() => {
  db.calls = [];
  db.error = null;
  db.rows = [{ id: ID }];
  vi.mocked(revalidatePath).mockClear();
});

describe("createProject", () => {
  test("grava na empresa do usuário logado, nunca na do formulário", async () => {
    const state = await createProject(
      undefined,
      form({ ...valid, organization_id: "org-intrusa" }),
    );
    expect(state).toEqual({ saved: true });
    expect(db.calls).toEqual([
      {
        op: "insert",
        payload: {
          organization_id: "org-1",
          name: "Site",
          description: null,
          status: "idea",
          priority: "medium",
          link: null,
        },
      },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/projetos");
  });

  test("entrada inválida volta os erros por campo e os valores digitados, sem gravar", async () => {
    const state = await createProject(
      undefined,
      form({ ...valid, name: "", link: "http://x" }),
    );
    expect(state).toMatchObject({
      errors: { name: expect.any(String), link: expect.any(String) },
      values: { name: "", link: "http://x", status: "idea" },
    });
    expect(db.calls).toEqual([]);
  });

  test("falha do banco vira mensagem geral, sem detalhes internos", async () => {
    db.error = { code: "42501", message: "permission denied" };
    const state = await createProject(undefined, form(valid));
    expect(state).toMatchObject({
      errors: { form: "Não foi possível salvar. Tente de novo." },
    });
  });
});

describe("updateProject", () => {
  test("altera o projeto pelo id", async () => {
    const state = await updateProject(
      undefined,
      form({ ...valid, id: ID, name: "Novo nome" }),
    );
    expect(state).toEqual({ saved: true });
    expect(db.calls[0]).toMatchObject({
      op: "update",
      id: ID,
      payload: { name: "Novo nome" },
    });
  });

  test("id inválido ou projeto fora da empresa não altera nada", async () => {
    expect(
      await updateProject(undefined, form({ ...valid, id: "abc" })),
    ).toMatchObject({ errors: { form: "Projeto não encontrado." } });
    expect(db.calls).toEqual([]);
    db.rows = [];
    expect(
      await updateProject(undefined, form({ ...valid, id: ID })),
    ).toMatchObject({ errors: { form: "Projeto não encontrado." } });
  });
});

describe("setArchived", () => {
  test("arquivar grava a data; restaurar limpa", async () => {
    await setArchived(form({ id: ID, archived: "true" }));
    await setArchived(form({ id: ID, archived: "false" }));
    expect(db.calls[0].payload).toEqual({ archived_at: expect.any(String) });
    expect(db.calls[1].payload).toEqual({ archived_at: null });
    expect(revalidatePath).toHaveBeenCalledTimes(2);
  });

  test("id inválido não chama o banco", async () => {
    await setArchived(form({ id: "abc", archived: "true" }));
    expect(db.calls).toEqual([]);
  });
});
