import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { CompanyName } from "@/components/company-name";

// Páginas do app, com a casca; a tela de entrada (/entrar) fica fora deste grupo.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      company={
        <Suspense>
          <CompanyName />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
