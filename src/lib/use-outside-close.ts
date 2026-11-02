import { useEffect, type FocusEvent, type RefObject } from "react";

// Painéis que abrem por cima (opções do passo, etiquetas): fecham com um toque fora deles.
export function useOutsideClose(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [ref, open, close]);
}

// Fecha quando o foco sai de verdade para fora (Tab). No Safari o clique num botão não dá foco a ele:
// o blur chega sem destino (relatedTarget nulo), e fechar ali perderia o próprio clique.
export function closeOnBlur(e: FocusEvent<HTMLElement>, close: () => void) {
  const next = e.relatedTarget as Node | null;
  if (next && !e.currentTarget.contains(next)) close();
}
