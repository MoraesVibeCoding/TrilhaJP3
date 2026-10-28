import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { DemandPage } from "@/components/demand-page";
import { listDemands } from "@/lib/demands";
import { listProjects } from "@/lib/projects";

export async function generateMetadata({
  params,
}: PageProps<"/demandas/[id]">): Promise<Metadata> {
  await connection();
  const { id } = await params;
  const title = (await listDemands()).find((d) => d.id === id)?.title;
  return { title: `${title ?? "Demanda"} · Trilha JP3` };
}

export default function Page({ params }: PageProps<"/demandas/[id]">) {
  // ler params fora de Suspense impede a navegação instantânea (cacheComponents)
  return (
    <Suspense fallback={<p>Carregando a demanda…</p>}>
      <Demand params={params} />
    </Suspense>
  );
}

async function Demand({ params }: Pick<PageProps<"/demandas/[id]">, "params">) {
  await connection();
  const { id } = await params;
  const [demands, projects] = await Promise.all([
    listDemands(),
    listProjects(),
  ]);
  return (
    <DemandPage
      id={id}
      demands={demands}
      projects={projects}
      now={new Date()}
    />
  );
}
