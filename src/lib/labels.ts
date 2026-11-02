// Etiquetas da empresa (T8). A paleta segue a migração 20261102120000_labels e os tokens da marca.
// Sem acesso ao banco: este arquivo também vai para o navegador (listLabels fica em demands.ts).

export const LABEL_COLORS = [
  { value: "nevoa", label: "Névoa" },
  { value: "mata", label: "Mata" },
  { value: "alta", label: "Alta" },
  { value: "mostarda", label: "Mostarda" },
  { value: "tijolo", label: "Tijolo" },
] as const;

export type LabelColor = (typeof LABEL_COLORS)[number]["value"];
export type Label = { id: string; name: string; color: LabelColor };

const MAX_NAME = 40;

export function validateLabelName(
  raw: string,
): { ok: true; name: string } | { ok: false; error: string } {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, error: "Escreva o nome da etiqueta." };
  if (name.length > MAX_NAME) {
    return { ok: false, error: `Nome com até ${MAX_NAME} caracteres.` };
  }
  return { ok: true, name };
}

// A comparação do banco (índice único): sem diferença de maiúsculas nem de espaços nas pontas.
export const sameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();
