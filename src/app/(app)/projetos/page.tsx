import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProjectList } from "@/components/project-list";
import { listProjects } from "@/lib/projects";

export const metadata: Metadata = { title: "Projetos · TrilhaJp3" };

// Lê a sessão e os dados da empresa: fica atrás de <Suspense> (cacheComponents).
export default function Page({ searchParams }: PageProps<"/projetos">) {
  return (
    <Suspense
      fallback={
        <>
          <h1>Projetos</h1>
          <p className="project-empty">Carregando projetos…</p>
        </>
      }
    >
      <Projects searchParams={searchParams} />
    </Suspense>
  );
}

async function Projects({
  searchParams,
}: Pick<PageProps<"/projetos">, "searchParams">) {
  // Dados por requisição: o cliente do Supabase lê o relógio, que não pode entrar na pré-renderização.
  await connection();
  const { arquivados } = await searchParams;
  return (
    <ProjectList
      projects={await listProjects()}
      showArchived={arquivados === "1"}
    />
  );
}
