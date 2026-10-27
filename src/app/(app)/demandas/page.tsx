import { connection } from "next/server";
import { Suspense } from "react";
import { DemandsBoard } from "@/components/demands-board";
import { listDemands } from "@/lib/demands";
import { listProjects } from "@/lib/projects";

// Lê a sessão e os dados da empresa: fica atrás de <Suspense> (cacheComponents).
export default function Page() {
  return (
    <>
      <h1>Demandas</h1>
      <Suspense fallback={<p className="project-empty">Carregando…</p>}>
        <Demands />
      </Suspense>
    </>
  );
}

async function Demands() {
  // O cliente do Supabase lê o relógio, que não pode entrar na pré-renderização.
  await connection();
  const [demands, projects] = await Promise.all([
    listDemands(),
    listProjects(),
  ]);
  return (
    <DemandsBoard demands={demands} projects={projects} now={new Date()} />
  );
}
