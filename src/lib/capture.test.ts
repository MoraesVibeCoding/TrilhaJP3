import { expect, test } from "vitest";
import {
  buildDemand,
  findSimilar,
  sanitizeCaptured,
  validateTitle,
} from "./capture";

const existing = [
  { id: "a", title: "Fotos da equipe" },
  { id: "b", title: "Revisar textos da página inicial" },
  { id: "c", title: "Definir fluxo de checkout" },
];

test("an empty or blank title is refused with a message that says what to do", () => {
  expect(validateTitle("   ")).toEqual({
    ok: false,
    error: "Escreva o título da demanda.",
  });
});

test("a title over 200 characters is refused", () => {
  expect(validateTitle("x".repeat(201)).ok).toBe(false);
  expect(validateTitle("x".repeat(200)).ok).toBe(true);
});

test("a valid title is trimmed and inner spaces collapsed", () => {
  expect(validateTitle("  Ajustar   menu  ")).toEqual({
    ok: true,
    title: "Ajustar menu",
  });
});

test("an identical title, ignoring case and accents, is similar", () => {
  expect(findSimilar("FOTOS DA EQUIPE", existing).map((d) => d.id)).toEqual([
    "a",
  ]);
  expect(findSimilar("definir fluxo de chéckout", existing)).toHaveLength(1);
});

test("a title that contains another (4+ letters) or shares most words is similar", () => {
  expect(findSimilar("Fotos da equipe do evento", existing)).toHaveLength(1);
  expect(findSimilar("Revisar textos da home", existing)).toHaveLength(1);
});

test("an unrelated title is not similar", () => {
  expect(findSimilar("Ajustar menu do celular", existing)).toEqual([]);
});

test("very short titles do not match by containment", () => {
  expect(findSimilar("da", existing)).toEqual([]);
});

test("at most three similar demands are returned", () => {
  const many = Array.from({ length: 6 }, (_, i) => ({
    id: String(i),
    title: "Ajustar menu",
  }));
  expect(findSimilar("Ajustar menu", many)).toHaveLength(3);
});

test("a new demand starts in A fazer, with no subtasks and the given priority", () => {
  const d = buildDemand({
    id: "c-1",
    title: "Ajustar menu",
    projectId: "p1",
    priority: "Alta",
    now: new Date("2026-10-23T12:00:00Z"),
  });
  expect(d).toMatchObject({
    id: "c-1",
    title: "Ajustar menu",
    projectId: "p1",
    priority: "Alta",
    state: "A fazer",
    subtasks: [],
    comments: [],
    attachments: [],
    history: [],
    lastActivityAt: "2026-10-23T12:00:00.000Z",
  });
});

const valid = {
  id: "c-1",
  title: "Ajustar menu",
  projectId: "p1",
  priority: "Média",
  state: "A fazer",
  subtasks: [],
  comments: [],
  attachments: [],
  history: [],
  lastActivityAt: "2026-10-23T12:00:00.000Z",
};

test("sanitizeCaptured keeps well-formed demands", () => {
  expect(sanitizeCaptured([valid])).toEqual([valid]);
});

test("sanitizeCaptured drops anything that is not a list or has bad fields", () => {
  expect(sanitizeCaptured("x")).toEqual([]);
  expect(sanitizeCaptured({ 0: valid })).toEqual([]);
  expect(
    sanitizeCaptured([
      valid,
      null,
      { ...valid, id: 7 },
      { ...valid, title: "x".repeat(201) },
      { ...valid, title: "   " },
      { ...valid, priority: "<b>x</b>" },
      { ...valid, state: "Feito" },
      { ...valid, lastActivityAt: "ontem" },
    ]),
  ).toEqual([valid]);
});

test("sanitizeCaptured forces the shape: no smuggled subtasks or extra fields", () => {
  const [d] = sanitizeCaptured([
    { ...valid, subtasks: [{ title: "x", done: true }], isNow: true, extra: 1 },
  ]);
  expect(d).toEqual(valid);
});

test("sanitizeCaptured keeps at most 500 demands", () => {
  const many = Array.from({ length: 600 }, (_, i) => ({
    ...valid,
    id: `c-${i}`,
  }));
  expect(sanitizeCaptured(many)).toHaveLength(500);
});
