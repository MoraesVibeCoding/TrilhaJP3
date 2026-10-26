import { useStoredState } from "./use-stored-state";

type Subtask = { title: string; done: boolean };
type Move = { state: string; lastActivityAt: string; doneAt?: string };
type Changes = {
  subtasks: Record<string, readonly Subtask[]>;
  // undefined = usa as marcas dos dados; null = nenhuma marcada
  nowId?: string | null;
  moves: Record<string, Move>;
};

export const CHANGES_STORAGE = "trilhajp3-alteracoes";
const NONE: Changes = { subtasks: {}, moves: {} };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function pick<T>(v: unknown, ok: (x: unknown) => x is T): Record<string, T> {
  if (!isRecord(v)) return {};
  return Object.fromEntries(
    Object.entries(v).filter(([, x]) => ok(x)),
  ) as Record<string, T>;
}

const isSubtasks = (v: unknown): v is readonly Subtask[] =>
  Array.isArray(v) &&
  v.every(
    (s) =>
      isRecord(s) && typeof s.title === "string" && typeof s.done === "boolean",
  );

const isMove = (v: unknown): v is Move =>
  isRecord(v) &&
  typeof v.state === "string" &&
  typeof v.lastActivityAt === "string" &&
  (v.doneAt === undefined || typeof v.doneAt === "string");

// O navegador guarda o que o Pedro mudou; um valor com outro formato vira "nada mudou".
function sanitize(v: unknown): Changes {
  if (!isRecord(v)) return NONE;
  const nowId =
    typeof v.nowId === "string" || v.nowId === null ? v.nowId : undefined;
  return {
    subtasks: pick(v.subtasks, isSubtasks),
    nowId,
    moves: pick(v.moves, isMove),
  };
}

// shortcut: as alterações ficam só no navegador, por cima dos dados de demonstração; somem com a T5/T7.
export function useDemandState<
  T extends {
    id: string;
    state: string;
    lastActivityAt: string;
    doneAt?: string;
    subtasks: readonly Subtask[];
    isNow?: boolean;
  },
>(demands: readonly T[], key = CHANGES_STORAGE) {
  const [stored, setStored] = useStoredState<unknown>(key, NONE);
  const changes = sanitize(stored);
  const { nowId } = changes;

  const current = demands.map((d) => ({
    ...d,
    ...changes.moves[d.id],
    // o JSON descarta doneAt indefinido: sem isso, sair de Feito manteria a data
    ...(changes.moves[d.id] && { doneAt: changes.moves[d.id].doneAt }),
    subtasks: changes.subtasks[d.id] ?? d.subtasks,
    isNow: nowId === undefined ? d.isNow : d.id === nowId,
  }));

  function conclude(id: string) {
    const list = current.find((d) => d.id === id)?.subtasks ?? [];
    const index = list.findIndex((s) => !s.done);
    if (index < 0) return;
    setStored({
      ...changes,
      subtasks: {
        ...changes.subtasks,
        [id]: list.map((s, i) => (i === index ? { ...s, done: true } : s)),
      },
    });
  }

  function moveTo(id: string, state: string) {
    const now = current.find((d) => d.id === id);
    if (!now || now.state === state) return;
    const at = new Date().toISOString();
    setStored({
      ...changes,
      moves: {
        ...changes.moves,
        [id]: {
          state,
          lastActivityAt: at,
          doneAt: state === "Feito" ? at : undefined,
        },
      },
    });
  }

  function toggleNow(id: string) {
    const marked = current.find((d) => d.id === id)?.isNow;
    setStored({ ...changes, nowId: marked ? null : id });
  }

  return { current, conclude, moveTo, toggleNow };
}
