import { useMemo } from "react";
import { sanitizeCaptured, type CapturedDemand } from "./capture";
import { useStoredState } from "./use-stored-state";

export const CAPTURED_STORAGE = "trilhajp3-capturadas";

// shortcut: demandas capturadas só no navegador antes da T5; existem até o Pedro importá-las ou descartá-las (T5.3).
export function useCapturedDemands(key = CAPTURED_STORAGE) {
  const [stored, setStored] = useStoredState<unknown>(key, []);
  const list = useMemo(() => sanitizeCaptured(stored), [stored]);
  return [list, setStored as (next: CapturedDemand[]) => void] as const;
}
