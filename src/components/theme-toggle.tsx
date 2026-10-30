"use client";

import { THEME_STORAGE_KEY } from "@/lib/theme-script";
import { useHtmlAttribute } from "@/lib/use-html-attribute";
import { Icon } from "./icon";

const THEMES = ["light", "dark"] as const;

export function ThemeToggle() {
  const theme = useHtmlAttribute(
    "data-theme",
    THEMES,
    () =>
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
    "light",
  );

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // armazenamento bloqueado: o tema vale só nesta visita
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-pressed={isDark}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={toggle}
    >
      <Icon name={isDark ? "sol" : "lua"} />
    </button>
  );
}
