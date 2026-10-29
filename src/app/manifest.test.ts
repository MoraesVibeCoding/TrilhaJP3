import { expect, test } from "vitest";
import manifest from "./manifest";

test("the app installs as TrilhaJp3 in full screen with the brand icons", () => {
  const m = manifest();
  expect(m).toMatchObject({
    name: "TrilhaJp3",
    short_name: "TrilhaJp3",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F2F2EE",
    theme_color: "#0C2A1E",
    description: "Sistema de gestão da Moraes Coding",
  });
  expect(m.icons).toEqual([
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ]);
});
