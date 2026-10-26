import { useCallback, useMemo, useSyncExternalStore } from "react";

const EVENT = "trilhajp3-stored-state";
// Reserva em memória: com o armazenamento bloqueado a escolha ainda vale nesta visita.
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

const kind = (v: unknown) =>
  v === null ? "null" : Array.isArray(v) ? "array" : typeof v;

// Valor salvo no navegador; no servidor e na primeira pintura vale `initial` (sem erro de hidratação).
export function useStoredState<T>(
  key: string,
  initial: T,
): [T, (value: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
  const value = useMemo(() => {
    if (raw === null) return initial;
    try {
      const parsed: unknown = JSON.parse(raw);
      // outro tipo (null no lugar de objeto, por exemplo) derrubaria quem lê: volta ao padrão
      return kind(parsed) === kind(initial) ? (parsed as T) : initial;
    } catch {
      return initial;
    }
  }, [raw, initial]);

  const set = useCallback(
    (next: T) => {
      const text = JSON.stringify(next);
      try {
        localStorage.setItem(key, text);
        memory.delete(key);
      } catch {
        // bloqueado: fica só em memória
        memory.set(key, text);
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );

  return [value, set];
}
