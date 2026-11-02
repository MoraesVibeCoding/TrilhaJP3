import { expect, test, vi } from "vitest";

const db = vi.hoisted(() => ({
  result: { data: [] as object[] | null, error: null as object | null },
  order: "",
}));
vi.mock("@/lib/auth", () => ({ getCurrentUser: async () => ({}) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      select: () => ({
        order: async (column: string) => {
          db.order = column;
          return db.result;
        },
      }),
    }),
  }),
}));

const { LABEL_COLORS, listLabels, validateLabelName } =
  await import("./labels");

test("the palette has the five brand colors, Névoa first as the default", () => {
  expect(LABEL_COLORS.map((c) => c.value)).toEqual([
    "nevoa",
    "mata",
    "alta",
    "mostarda",
    "tijolo",
  ]);
  expect(LABEL_COLORS[0].label).toBe("Névoa");
});

test("a name is trimmed, spaces collapse, and it has 1 to 40 characters", () => {
  expect(validateLabelName("  cliente   aguardando ")).toEqual({
    ok: true,
    name: "cliente aguardando",
  });
  expect(validateLabelName("   ")).toEqual({
    ok: false,
    error: "Escreva o nome da etiqueta.",
  });
  expect(validateLabelName("x".repeat(41))).toEqual({
    ok: false,
    error: "Nome com até 40 caracteres.",
  });
  expect(validateLabelName("x".repeat(40)).ok).toBe(true);
});

test("listLabels reads the company labels by name, and a database error is not an empty list", async () => {
  db.result = {
    data: [{ id: "l1", name: "Bug", color: "tijolo" }],
    error: null,
  };
  await expect(listLabels()).resolves.toEqual([
    { id: "l1", name: "Bug", color: "tijolo" },
  ]);
  expect(db.order).toBe("name");
  db.result = { data: null, error: { message: "falhou" } };
  await expect(listLabels()).rejects.toEqual({ message: "falhou" });
});
