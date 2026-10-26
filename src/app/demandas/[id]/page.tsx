import type { Metadata } from "next";
import { Suspense } from "react";
import { DemandPage } from "@/components/demand-page";
import { demoDemands, demoNow, demoProjects } from "@/lib/demo-data";

// As de demonstração saem prontas no build; as da captura rápida (só no navegador) renderizam no primeiro pedido.
export function generateStaticParams() {
  return demoDemands.map((d) => ({ id: d.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/demandas/[id]">): Promise<Metadata> {
  const { id } = await params;
  const title = demoDemands.find((d) => d.id === id)?.title ?? "Demanda";
  return { title: `${title} · TrilhaJp3` };
}

export default function Page({ params }: PageProps<"/demandas/[id]">) {
  return (
    <>
      {/* ler params fora de Suspense impede a navegação instantânea (cacheComponents) */}
      <Suspense fallback={<p>Carregando a demanda…</p>}>
        <Demand params={params} />
      </Suspense>
      <p role="note" className="demo-note">
        Dados de demonstração: projetos e demandas fictícios, só para avaliar o
        visual.
      </p>
    </>
  );
}

async function Demand({ params }: Pick<PageProps<"/demandas/[id]">, "params">) {
  const { id } = await params;
  return (
    <DemandPage
      id={id}
      demands={demoDemands}
      projects={demoProjects}
      now={demoNow}
    />
  );
}
