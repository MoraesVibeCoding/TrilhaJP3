"use client";

import { useCallback, useEffect, useState } from "react";
import { MODE_STORAGE_KEY } from "@/lib/mode-script";
import { useHtmlAttribute } from "@/lib/use-html-attribute";
import { Icon } from "./icon";

const MODES = ["full", "focus"] as const;

export function ModeToggle() {
  const mode = useHtmlAttribute("data-mode", MODES, () => "full", "full");
  const [announcement, setAnnouncement] = useState("");
  const isFocus = mode === "focus";

  const toggle = useCallback(() => {
    const next = isFocus ? "full" : "focus";
    document.documentElement.dataset.mode = next;
    setAnnouncement(
      next === "focus" ? "Modo foco ativado" : "Modo completo ativado",
    );
    try {
      localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {
      // armazenamento bloqueado: o modo vale só nesta visita
    }
  }, [isFocus]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "f") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      toggle();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return (
    <>
      <button
        type="button"
        className="icon-button"
        aria-pressed={isFocus}
        aria-label={isFocus ? "Ativar modo completo" : "Ativar modo foco"}
        title="Alternar Foco e Completo (F)"
        onClick={toggle}
      >
        <Icon name={isFocus ? "painel" : "visualizar"} />
      </button>
      <span role="status" className="visually-hidden">
        {announcement}
      </span>
    </>
  );
}
