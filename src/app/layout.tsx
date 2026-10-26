import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { modeScript } from "@/lib/mode-script";
import { themeScript } from "@/lib/theme-script";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrilhaJp3",
  description: "Sistema de gestão da Moraes CodeVibe",
  // instalado na tela inicial do iPad: barra de status padrão, o conteúdo não fica por baixo dela
  appleWebApp: { title: "TrilhaJp3", statusBarStyle: "default" },
};

// A barra do navegador acompanha o fundo da página: Papel no claro, Tinta no escuro.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAF5" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1F14" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${geist.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: `${themeScript};${modeScript}` }}
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
