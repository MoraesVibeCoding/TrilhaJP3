import { AppShell } from "@/components/app-shell";

// Páginas do app, com a casca; a tela de entrada (/entrar) fica fora deste grupo.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
