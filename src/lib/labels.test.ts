import { expect, test } from "vitest";
import { LABEL_COLORS, validateLabelName } from "./labels";

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
