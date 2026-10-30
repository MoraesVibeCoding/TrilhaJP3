import type { MetadataRoute } from "next";

// Instalável sem service worker: a v1 não tem modo offline (PRODUCT.md).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrilhaJp3",
    short_name: "TrilhaJp3",
    description: "Sistema de gestão da Moraes Coding",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F2F2EE",
    // Mata: o fundo do ícone do app (mc-app-icone.svg)
    theme_color: "#0C2A1E",
    icons: [
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
    ],
  };
}
