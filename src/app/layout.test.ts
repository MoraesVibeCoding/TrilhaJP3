import { expect, test, vi } from "vitest";

// next/font só funciona dentro do Next; aqui basta o nome da variável CSS
vi.mock("next/font/google", () => ({
  Space_Grotesk: () => ({ variable: "font-space-grotesk" }),
  IBM_Plex_Mono: () => ({ variable: "font-ibm-plex-mono" }),
}));

test("installed on the iPad it is titled TrilhaJp3, and the bar follows the page background (Gelo, Mata)", async () => {
  const { metadata, viewport } = await import("./layout");
  expect(metadata.appleWebApp).toEqual({
    title: "TrilhaJp3",
    statusBarStyle: "default",
  });
  expect(viewport.themeColor).toEqual([
    { media: "(prefers-color-scheme: light)", color: "#F2F2EE" },
    { media: "(prefers-color-scheme: dark)", color: "#0C2A1E" },
  ]);
});
