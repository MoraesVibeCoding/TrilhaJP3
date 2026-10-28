import { expect, test, vi } from "vitest";

// next/font só funciona dentro do Next; aqui basta o nome da variável CSS
vi.mock("next/font/google", () => ({
  Space_Grotesk: () => ({ variable: "font-space-grotesk" }),
  IBM_Plex_Mono: () => ({ variable: "font-ibm-plex-mono" }),
}));

test("installed on the iPad it is titled Trilha JP3, and the bar follows the top bar (Mata, Noite)", async () => {
  const { metadata, viewport } = await import("./layout");
  expect(metadata.appleWebApp).toEqual({
    title: "Trilha JP3",
    statusBarStyle: "default",
  });
  expect(viewport.themeColor).toEqual([
    { media: "(prefers-color-scheme: light)", color: "#0C2A1E" },
    { media: "(prefers-color-scheme: dark)", color: "#08180F" },
  ]);
});
