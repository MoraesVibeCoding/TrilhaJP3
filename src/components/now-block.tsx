import { useId } from "react";
import type { ResumeItem } from "@/lib/resume";
import { StepProgress } from "./step-progress";

export function NowBlock({
  item,
  suggested,
  onConclude,
  onOpen,
}: {
  item: ResumeItem;
  suggested: boolean;
  onConclude: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="now-block">
      <h2 id={headingId}>Agora</h2>
      <button
        type="button"
        className="resume-open now-title"
        onClick={() => onOpen(item.id)}
      >
        {item.title}
      </button>
      <p className="resume-project">{item.projectName}</p>
      {suggested && (
        <p className="resume-project">Sugestão: a mais recente em andamento.</p>
      )}
      {item.nextSubtask ? (
        <>
          <p className="detail-now-step">{item.nextSubtask}</p>
          <p className="detail-now-count">
            Passo {item.nextStepNumber} de {item.subtasksTotal}
          </p>
          <StepProgress done={item.subtasksDone} total={item.subtasksTotal} />
          <button
            type="button"
            className="primary-button"
            onClick={() => onConclude(item.id)}
          >
            Concluir passo
          </button>
        </>
      ) : (
        <p className="detail-now-empty">
          {item.subtasksTotal === 0 ? "Sem subtarefas" : "Sem passos pendentes"}
        </p>
      )}
    </section>
  );
}
