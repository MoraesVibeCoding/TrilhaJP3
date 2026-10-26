import { useCallback, useMemo } from "react";
import { sanitizeCaptured, type CapturedDemand } from "./capture";
import { useStoredState } from "./use-stored-state";

export const CAPTURED_STORAGE = "trilhajp3-capturadas";

// shortcut: as demandas capturadas ficam só no navegador, unidas aos dados de demonstração; somem com a T5.
export function useCapturedDemands(key = CAPTURED_STORAGE) {
  const [stored, setStored] = useStoredState<unknown>(key, []);
  const list = useMemo(() => sanitizeCaptured(stored), [stored]);
  const add = useCallback(
    (demand: CapturedDemand) => setStored([...list, demand]),
    [list, setStored],
  );
  return [list, add] as const;
}

// Uma demanda nova tem todos os campos que as duas telas (Retomar e Demandas) exigem.
export function useWithCaptured<T>(
  demands: readonly T[],
  key = CAPTURED_STORAGE,
): readonly T[] {
  const [captured] = useCapturedDemands(key);
  return useMemo(
    () => [...demands, ...(captured as unknown as readonly T[])],
    [demands, captured],
  );
}
