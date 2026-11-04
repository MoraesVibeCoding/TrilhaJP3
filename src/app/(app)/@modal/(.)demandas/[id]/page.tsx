// As Server Actions da janela precisam estar nesta rota: com a janela aberta, é ela que responde às
// gravações. Sem este import, o Next responde "Failed to find Server Action" (reproduzido em 2026-11-04).
import "@/app/(app)/demandas/actions";

// A janela da demanda é desenhada por Retomar e Demandas. Esta rota só intercepta /demandas/{id} na
// navegação dentro do app, para o Next manter a lista na tela; recarregar mostra a página inteira.
export default function InterceptedDemand() {
  return null;
}
