import Link from "next/link";
import { ResumeBoard } from "@/components/resume-board";
import { demoDemands, demoNow, demoProjects } from "@/lib/demo-data";

export default function Page() {
  return (
    <>
      <div className="page-head">
        <h1>Retomar</h1>
        <Link href="/demandas" className="page-link">
          Todas as demandas
        </Link>
      </div>
      <p role="note" className="demo-note">
        Dados de demonstração: projetos e demandas fictícios, só para avaliar o
        visual.
      </p>
      <ResumeBoard
        demands={demoDemands}
        projects={demoProjects}
        now={demoNow}
      />
    </>
  );
}
