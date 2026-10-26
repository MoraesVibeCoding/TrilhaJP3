import type { Metadata } from "next";
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
