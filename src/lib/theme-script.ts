import { attributeScript } from "./attribute-script";

export const THEME_STORAGE_KEY = "trilhajp3-theme";

// Roda no <head> antes da primeira pintura (guia "Preventing Flash" do Next 16).
export const themeScript = attributeScript(THEME_STORAGE_KEY, "data-theme", [
  "light",
  "dark",
]);
