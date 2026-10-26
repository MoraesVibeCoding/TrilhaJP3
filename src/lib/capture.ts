import { PRIORITIES, type DemoDemand, type Priority } from "./demo-data";

export type CapturedDemand = ReturnType<typeof buildDemand>;

export const MAX_CAPTURED = 500;

const MAX_TITLE = 200;

export function validateTitle(
  raw: string,
): { ok: true; title: string } | { ok: false; error: string } {
  const title = raw.trim().replace(/\s+/g, " ");
  if (!title) return { ok: false, error: "Escreva o título da demanda." };
  if (title.length > MAX_TITLE) {
    return { ok: false, error: `Título com até ${MAX_TITLE} caracteres.` };
  }
  return { ok: true, title };
}

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
// palavras de ligação (da, de, do) inflariam a semelhança
const words = (text: string) =>
  new Set(
    normalize(text)
      .split(" ")
      .filter((w) => w.length >= 3),
  );

// A busca por relevância não é filtro: antes de criar, avisa de título parecido para não duplicar.
export function findSimilar<T extends { id: string; title: string }>(
  title: string,
  existing: readonly T[],
): T[] {
  const a = normalize(title);
  const wa = words(title);
  return existing
    .filter((d) => {
      const b = normalize(d.title);
      if (!a || !b) return false;
      if (a === b) return true;
      const [short, long] = a.length <= b.length ? [a, b] : [b, a];
      if (short.length >= 4 && long.includes(short)) return true;
      const wb = words(d.title);
      const shared = [...wa].filter((w) => wb.has(w)).length;
      const smaller = Math.min(wa.size, wb.size);
      return smaller >= 2 && shared / smaller >= 0.6;
    })
    .slice(0, 3);
}

export function buildDemand(input: {
  id: string;
  title: string;
  projectId: string;
  priority: Priority;
  now: Date;
}): DemoDemand & {
  comments: [];
  attachments: [];
  history: [];
} {
  return {
    id: input.id,
    title: input.title,
    projectId: input.projectId,
    priority: input.priority,
    state: "A fazer",
    subtasks: [],
    comments: [],
    attachments: [],
    history: [],
    lastActivityAt: input.now.toISOString(),
  };
}

// O que vem do armazenamento do navegador não é confiável: só entra o que tem a forma exata de uma demanda nova.
export function sanitizeCaptured(raw: unknown): CapturedDemand[] {
  if (!Array.isArray(raw)) return [];
  const out: CapturedDemand[] = [];
  for (const item of raw) {
    if (out.length >= MAX_CAPTURED) break;
    if (typeof item !== "object" || item === null) continue;
    const r = item as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      !r.id ||
      typeof r.title !== "string" ||
      typeof r.projectId !== "string" ||
      typeof r.priority !== "string" ||
      !(PRIORITIES as readonly string[]).includes(r.priority) ||
      r.state !== "A fazer" ||
      typeof r.lastActivityAt !== "string" ||
      Number.isNaN(Date.parse(r.lastActivityAt))
    ) {
      continue;
    }
    const title = validateTitle(r.title);
    if (!title.ok) continue;
    out.push(
      buildDemand({
        id: r.id,
        title: title.title,
        projectId: r.projectId,
        priority: r.priority as Priority,
        now: new Date(r.lastActivityAt),
      }),
    );
  }
  return out;
}
