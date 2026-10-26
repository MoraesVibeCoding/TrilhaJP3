import { DemandsBoard } from "@/components/demands-board";
import { demoDemands, demoNow, demoProjects } from "@/lib/demo-data";

export default function Page() {
  return (
    <>
      <h1>Demandas</h1>
      <p role="note" className="demo-note">
        Dados de demonstração: projetos e demandas fictícios, só para avaliar o
        visual.
      </p>
      <DemandsBoard
        demands={demoDemands}
        projects={demoProjects}
        now={demoNow}
      />
    </>
  );
}
