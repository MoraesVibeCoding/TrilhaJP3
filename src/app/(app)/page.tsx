import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ResumeBoard } from "@/components/resume-board";
import { listDemands } from "@/lib/demands";
import { listProjects } from "@/lib/projects";

function Head() {
  return (
    <div className="page-head">
      <h1>Retomar</h1>
      <Link href="/demandas" className="page-link">
        Todas as demandas
      </Link>
    </div>
  );
}

// Lê a sessão e os dados da empresa: fica atrás de <Suspense> (cacheComponents).
export default function Page() {
  return (
    <Suspense
      fallback={
        <>
          <Head />
          <p className="project-empty">Carregando…</p>
        </>
      }
    >
      <Resume />
    </Suspense>
  );
}

async function Resume() {
  // O cliente do Supabase lê o relógio, que não pode entrar na pré-renderização.
  await connection();
  const [demands, projects] = await Promise.all([
    listDemands(),
    listProjects(),
  ]);
  return (
    <>
      <Head />
      <ResumeBoard demands={demands} projects={projects} now={new Date()} />
    </>
  );
}
