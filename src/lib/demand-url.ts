import { useCallback, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

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

// Endereço pedido ao Next e ainda não aplicado: o router.push só troca o endereço depois de buscar a rota.
let asked: string | null = null;

function subscribe(onChange: () => void) {
  const back = () => {
    asked = null;
    onChange();
  };
  window.addEventListener("popstate", back);
  window.addEventListener(MOVED, onChange);
  return () => {
    window.removeEventListener("popstate", back);
    window.removeEventListener(MOVED, onChange);
  };
}

function current() {
  // o Next aplicou o endereço pedido: dali em diante vale o do navegador
  if (asked === window.location.pathname) asked = null;
  return asked ?? window.location.pathname;
}

// A janela aberta é o endereço: abrir empilha /demandas/{id}, fechar volta. Voltar e Avançar do navegador fecham e reabrem.
// Abre pelo roteador do Next, não por pushState: assim a rota interceptada em @modal mantém a lista na tela
// quando uma Server Action recarrega a página (com pushState, a página inteira tomava o lugar da lista).
// Lê o endereço do navegador, não o usePathname: o do Next chega numa transição e a janela abriria atrasada.
export function useOpenDemand() {
  const router = useRouter();
  // no servidor e na hidratação vale o endereço do Next: igual ao do navegador, sem renderização extra
  const routed = usePathname();
  const pathname = useSyncExternalStore(subscribe, current, () => routed);
  const openId = demandIdFromPath(pathname ?? "");
  const open = useCallback(
    (id: string) => {
      asked = demandPath(id);
      window.dispatchEvent(new Event(MOVED));
      router.push(asked, { scroll: false });
    },
    [router],
  );
  const close = useCallback(() => {
    // o segundo clique antes de o endereço mudar não pode voltar duas páginas
    if (demandIdFromPath(window.location.pathname) !== null)
      window.history.back();
  }, []);
  return [openId, open, close] as const;
}
