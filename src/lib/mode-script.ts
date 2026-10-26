import { attributeScript } from "./attribute-script";

export const MODE_STORAGE_KEY = "trilhajp3-mode";

// Foco mostra só o essencial; Completo mostra tudo (docs/PRINCIPIOS-OBJETIVOS.md, 5b).
export const modeScript = attributeScript(MODE_STORAGE_KEY, "data-mode", [
  "focus",
  "full",
]);
