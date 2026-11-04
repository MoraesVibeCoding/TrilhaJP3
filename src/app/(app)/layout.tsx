import { AppShell } from "@/components/app-shell";

// Páginas do app, com a casca; a tela de entrada (/entrar) fica fora deste grupo.
// modal: rota interceptada da janela da demanda (vazia, ver @modal).
export default function AppLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <AppShell>
      {children}
      {modal}
    </AppShell>
  );
}
