import { useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

export const demandPath = (id: string) => `/demandas/${encodeURIComponent(id)}`;

export function demandIdFromPath(pathname: string): string | null {
  const match = /^\/demandas\/([^/]+)$/.exec(pathname);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

const MOVED = "trilhajp3-demand-url";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(MOVED, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(MOVED, onChange);
  };
}

// A janela aberta é o endereço: abrir empilha /demandas/{id}, fechar volta. Voltar e Avançar do navegador fecham e reabrem.
// Lê o endereço do navegador, não o usePathname: o do Next chega numa transição e a janela abriria atrasada.
export function useOpenDemand() {
  // no servidor e na hidratação vale o endereço do Next: igual ao do navegador, sem renderização extra
  const routed = usePathname();
  const pathname = useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => routed,
  );
  const openId = demandIdFromPath(pathname ?? "");
  const open = useCallback((id: string) => {
    window.history.pushState(null, "", demandPath(id));
    window.dispatchEvent(new Event(MOVED));
  }, []);
  const close = useCallback(() => {
    // o segundo clique antes de o endereço mudar não pode voltar duas páginas
    if (demandIdFromPath(window.location.pathname) !== null)
      window.history.back();
  }, []);
  return [openId, open, close] as const;
}
