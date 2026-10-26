"use client";

import { useCallback, useEffect, useState } from "react";
import { MODE_STORAGE_KEY } from "@/lib/mode-script";
import { useHtmlAttribute } from "@/lib/use-html-attribute";

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
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {isFocus ? (
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
      <span role="status" className="visually-hidden">
        {announcement}
      </span>
    </>
  );
}
