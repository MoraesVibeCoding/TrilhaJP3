import Link from "next/link";
import { formatActivity, type ResumeItem } from "@/lib/resume";

export function ResumeList({
  items,
  now,
  onOpen,
}: {
  items: readonly ResumeItem[];
  now: Date;
  onOpen: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="resume-empty">
        Nada em andamento agora.{" "}
        <Link href="/demandas">Ver todas as demandas</Link>
      </p>
    );
  }

  return (
    <ul aria-label="Em andamento" className="resume-list">
      {items.map((item) => (
        <li key={item.id}>
          <div className="resume-main">
            <button
              type="button"
              className="resume-title resume-open"
              onClick={() => onOpen(item.id)}
            >
              {item.title}
            </button>
            <span className="resume-project">{item.projectName}</span>
          </div>
          <div className="resume-meta">
            <span>{formatActivity(item.lastActivityAt, now)}</span>
            {item.subtasksTotal > 0 && (
              <span>
                {item.subtasksDone} de {item.subtasksTotal} subtarefas
              </span>
            )}
          </div>
          <p className="resume-next">
            {item.nextSubtask
              ? `Próxima: ${item.nextSubtask}`
              : item.subtasksTotal === 0
                ? "Sem subtarefas"
                : "Sem subtarefas pendentes"}
          </p>
        </li>
      ))}
    </ul>
  );
}
