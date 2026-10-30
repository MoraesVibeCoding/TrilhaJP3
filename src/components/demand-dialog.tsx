"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { Icon } from "./icon";

export function DemandDialog({
  open,
  onClose,
  title,
  pageHref,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  pageHref?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closedByParent = useRef(false);
  const titleId = useId();
  // Quem abriu fica guardado entre ocultar e mostrar a rota (Activity do Next): o efeito roda de novo, mas o foco já se perdeu.
  const opener = useRef<HTMLElement | null>(null);
  const openNow = useRef(open);
  // layout effect: roda antes da limpeza do efeito abaixo e não escreve em ref durante a renderização
  useLayoutEffect(() => {
    openNow.current = open;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    opener.current ??= document.activeElement as HTMLElement | null;
    dialog.showModal();
    // a primeira linha é a ação: o foco inicial vai ao que estiver marcado, não ao botão Fechar
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      // o navegador não devolve o foco sozinho de forma garantida: faz à mão
      if (dialog.open) {
        closedByParent.current = true;
        dialog.close();
      }
      opener.current?.focus();
      // com open ainda verdadeiro a rota só foi escondida: o opener vale quando ela voltar
      if (!openNow.current) opener.current = null;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="demand-dialog"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onClose={() => {
        if (closedByParent.current) closedByParent.current = false;
        else onClose();
      }}
    >
      <div className="demand-dialog-body">
        <header className="demand-dialog-head">
          <h2 id={titleId}>{title}</h2>
          {pageHref && (
            // replace: Voltar a partir da página leva à lista, não à janela de novo
            <Link className="dialog-page-link" href={pageHref} replace>
              Abrir em página inteira
            </Link>
          )}
          <button
            type="button"
            className="icon-button"
            aria-label="Fechar"
            onClick={onClose}
          >
            <Icon name="fechar" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
