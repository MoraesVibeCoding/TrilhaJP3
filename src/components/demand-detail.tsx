import type { Demand, DemandState } from "@/lib/demand-labels";
import { CommentThread } from "./comment-thread";
import type { Label } from "@/lib/labels";
import { LabelPicker } from "./label-picker";
import { StepProgress } from "./step-progress";
import { SubtaskList, type SubtaskEditor } from "./subtask-list";

export { SubtaskList };

export type DetailData = {
  id: string;
  title: string;
  state: DemandState;
  comments: Demand["comments"];
  attachments: readonly { name: string }[];
  history: readonly { at: string; text: string }[];
  labels?: readonly Label[];
};

type Subtask = { id: string; title: string; done: boolean };

export function DemandDetail({
  data,
  subtasks,
  isNow,
  onConclude,
  onToggleNow,
  steps,
  allLabels,
  now = new Date(),
}: {
  data: DetailData;
  subtasks: readonly Subtask[];
  isNow: boolean;
  onConclude: (id: string) => void;
  onToggleNow: (id: string) => void;
  steps?: SubtaskEditor;
  // T8: as etiquetas da empresa; sem elas, a janela não mostra o painel
  allLabels?: readonly Label[];
  // A janela só abre no navegador: sem "agora" do servidor, vale o relógio de quem vê.
  now?: Date;
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

      {allLabels && (
        <LabelPicker
          taskId={data.id}
          applied={data.labels ?? []}
          all={allLabels}
        />
      )}

      <section aria-label="Agora" className="detail-now">
        <DetailNow subtasks={subtasks} onConclude={() => onConclude(data.id)} />
      </section>

      <details open className="detail-group">
        <summary>
          Subtarefas <span className="count">({subtasks.length})</span>
        </summary>
        <SubtaskList subtasks={subtasks} editor={steps} />
      </details>

      <details className="detail-group">
        <CommentThread
          taskId={data.id}
          comments={data.comments}
          now={now}
          heading={(n) => (
            <summary>
              Comentários <span className="count">({n})</span>
            </summary>
          )}
        />
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
