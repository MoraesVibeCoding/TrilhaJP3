import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { modeScript } from "@/lib/mode-script";
import { themeScript } from "@/lib/theme-script";
import "./globals.css";

// Marca Moraes Coding: Space Grotesk no texto e nos títulos, IBM Plex Mono nos números e rótulos
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Trilha JP3",
  description: "Sistema de gestão da Moraes Coding",
  // instalado na tela inicial do iPad: barra de status padrão, o conteúdo não fica por baixo dela
  appleWebApp: { title: "Trilha JP3", statusBarStyle: "default" },
};

// A barra do navegador acompanha o topo do app: Mata no claro, Noite no escuro.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0C2A1E" },
    { media: "(prefers-color-scheme: dark)", color: "#08180F" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${plexMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: `${themeScript};${modeScript}` }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
