import { startTransition, useOptimistic } from "react";
import { concludeStep, moveDemand, setNow } from "@/app/(app)/demandas/actions";
import { stateValue } from "./demand-labels";
import { useFlashMessage } from "./use-flash-message";

type Subtask = { id: string; title: string; done: boolean };
type Change =
  | { id: string; state: string; at: string }
  | { id: string; step: true }
  | { id: string; now: boolean };

const FAILED = "Não foi possível salvar. Tente de novo.";

function applyChange<
  T extends {
    id: string;
    subtasks: readonly Subtask[];
    isNow?: boolean;
  },
>(list: readonly T[], change: Change): readonly T[] {
  return list.map((d) => {
    if ("now" in change)
      return d.id === change.id
        ? { ...d, isNow: change.now }
        : change.now
          ? { ...d, isNow: false }
          : d;
    if (d.id !== change.id) return d;
    if ("state" in change)
      return {
        ...d,
        state: change.state,
        lastActivityAt: change.at,
        doneAt: change.state === "Feito" ? change.at : undefined,
      };
    const next = d.subtasks.findIndex((s) => !s.done);
    return {
      ...d,
      subtasks: d.subtasks.map((s, i) =>
        i === next ? { ...s, done: true } : s,
      ),
    };
  });
}

// A tela muda na hora; a Server Action grava, e as telas recarregam do banco. Se não gravar, volta e avisa.
export function useDemandState<
  T extends {
    id: string;
    state: string;
    lastActivityAt: string;
    doneAt?: string;
    subtasks: readonly Subtask[];
    isNow?: boolean;
  },
>(demands: readonly T[]) {
  const [current, apply] = useOptimistic(demands, applyChange<T>);
  const [failure, setFailure] = useFlashMessage();

  function run(change: Change, save: () => Promise<boolean>) {
    startTransition(async () => {
      apply(change);
      if (!(await save())) setFailure(FAILED);
    });
  }

  function conclude(id: string) {
    const d = current.find((x) => x.id === id);
    if (!d?.subtasks.some((s) => !s.done)) return;
    run({ id, step: true }, () => concludeStep(id));
  }

  function moveTo(id: string, state: string) {
    const d = current.find((x) => x.id === id);
    const value = stateValue(state);
    if (!d || !value || d.state === state) return;
    run({ id, state, at: new Date().toISOString() }, () =>
      moveDemand(id, value),
    );
  }

  function toggleNow(id: string) {
    const now = !current.find((x) => x.id === id)?.isNow;
    run({ id, now }, () => setNow(id, now));
  }

  return { current, conclude, moveTo, toggleNow, failure };
}
