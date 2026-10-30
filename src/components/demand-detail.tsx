import type { DemandState } from "@/lib/demand-labels";
import { StepProgress } from "./step-progress";

export type DetailData = {
  id: string;
  title: string;
  state: DemandState;
  comments: readonly { author: string; at: string; text: string }[];
  attachments: readonly { name: string }[];
  history: readonly { at: string; text: string }[];
};

type Subtask = { title: string; done: boolean };

export function DemandDetail({
  data,
  subtasks,
  isNow,
  onConclude,
  onToggleNow,
}: {
  data: DetailData;
  subtasks: readonly Subtask[];
  isNow: boolean;
  onConclude: (id: string) => void;
  onToggleNow: (id: string) => void;
}) {
  return (
    <>
      <p className="detail-state">
        <span className="badge" data-state={data.state}>
          {data.state}
        </span>
        {data.state !== "Feito" && (
          <NowToggle isNow={isNow} onToggle={() => onToggleNow(data.id)} />
        )}
      </p>

      <section aria-label="Agora" className="detail-now">
        <DetailNow subtasks={subtasks} onConclude={() => onConclude(data.id)} />
      </section>

      <details open className="detail-group">
        <summary>
          Subtarefas <span className="count">({subtasks.length})</span>
        </summary>
        <SubtaskList subtasks={subtasks} />
      </details>

      <details className="detail-group">
        <summary>
          Comentários <span className="count">({data.comments.length})</span>
        </summary>
        <CommentList comments={data.comments} />
      </details>

      <details className="detail-group">
        <summary>
          Anexos <span className="count">({data.attachments.length})</span>
        </summary>
        <AttachmentList attachments={data.attachments} />
      </details>

      <details className="detail-group">
        <summary>
          Histórico <span className="count">({data.history.length})</span>
        </summary>
        <HistoryList history={data.history} />
      </details>
    </>
  );
}

// Peças da janela, reaproveitadas pela página inteira (T5b).
export function NowToggle({
  isNow,
  onToggle,
}: {
  isNow: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" className="secondary-button" onClick={onToggle}>
      {isNow ? "Tirar de Agora" : "Marcar como Agora"}
    </button>
  );
}

export function DetailNow({
  subtasks,
  onConclude,
}: {
  subtasks: readonly Subtask[];
  onConclude: () => void;
}) {
  const nextIndex = subtasks.findIndex((s) => !s.done);
  const next = nextIndex >= 0 ? subtasks[nextIndex] : null;
  if (!next)
    return (
      <p className="detail-now-step">
        {subtasks.length === 0 ? "Sem subtarefas" : "Sem passos pendentes"}
      </p>
    );
  return (
    <>
      <p className="detail-now-step">{next.title}</p>
      <p className="detail-now-count">
        Passo {nextIndex + 1} de {subtasks.length}
      </p>
      <StepProgress
        done={subtasks.filter((s) => s.done).length}
        total={subtasks.length}
      />
      <button
        type="button"
        className="primary-button"
        data-autofocus
        onClick={onConclude}
      >
        Concluir passo
      </button>
    </>
  );
}

export function SubtaskList({
  subtasks,
  label,
}: {
  subtasks: readonly Subtask[];
  label?: string;
}) {
  if (subtasks.length === 0) return <p>Nenhuma subtarefa.</p>;
  const nextIndex = subtasks.findIndex((s) => !s.done);
  return (
    <ol className="detail-list" aria-label={label}>
      {subtasks.map((s, i) => (
        <li
          key={s.title}
          data-done={s.done}
          aria-current={i === nextIndex ? "step" : undefined}
        >
          {s.title}
          {s.done && <span className="detail-meta"> feito</span>}
          {i === nextIndex && <span className="detail-meta"> agora</span>}
        </li>
      ))}
    </ol>
  );
}

export function CommentList({
  comments,
}: {
  comments: DetailData["comments"];
}) {
  if (comments.length === 0) return <p>Nenhum comentário.</p>;
  return (
    <ul className="detail-list">
      {comments.map((c) => (
        <li key={c.at + c.text}>
          <span className="detail-meta">
            {c.author}, {c.at}
          </span>
          <br />
          {c.text}
        </li>
      ))}
    </ul>
  );
}

export function AttachmentList({
  attachments,
}: {
  attachments: DetailData["attachments"];
}) {
  if (attachments.length === 0) return <p>Nenhum anexo.</p>;
  return (
    <ul className="detail-list">
      {attachments.map((a) => (
        <li key={a.name}>{a.name}</li>
      ))}
    </ul>
  );
}

export function HistoryList({ history }: { history: DetailData["history"] }) {
  if (history.length === 0) return <p>Sem alterações.</p>;
  return (
    <ul className="detail-list">
      {history.map((h) => (
        <li key={h.at + h.text}>
          <span className="detail-meta">{h.at}</span>
          <br />
          {h.text}
        </li>
      ))}
    </ul>
  );
}
