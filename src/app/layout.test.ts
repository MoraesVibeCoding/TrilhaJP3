import { expect, test, vi } from "vitest";

// next/font só funciona dentro do Next; aqui basta o nome da variável CSS
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist" }),
}));

test("installed on the iPad it is titled TrilhaJp3, and the bar follows the page background", async () => {
  const { metadata, viewport } = await import("./layout");
  expect(metadata.appleWebApp).toEqual({
    title: "TrilhaJp3",
    statusBarStyle: "default",
  });
  expect(viewport.themeColor).toEqual([
    { media: "(prefers-color-scheme: light)", color: "#F8FAF5" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1F14" },
  ]);
});
