import { useCallback, useSyncExternalStore } from "react";

// Lê um atributo de <html> (tema, modo) e re-renderiza quando ele muda.
export function useHtmlAttribute<T extends string>(
  attr: string,
  allowed: readonly T[],
  fallback: () => T,
  serverValue: T,
): T {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: [attr],
      });
      return () => observer.disconnect();
    },
    [attr],
  );
  return useSyncExternalStore<T>(
    subscribe,
    () => {
      const value = document.documentElement.getAttribute(attr) as T | null;
      return value && allowed.includes(value) ? value : fallback();
    },
    () => serverValue,
  );
}
