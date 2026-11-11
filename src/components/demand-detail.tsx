import { dayLabel } from "@/lib/comments";
import { zoned } from "@/lib/zone";
import type { Demand, DemandState } from "@/lib/demand-labels";
import { AttachmentList } from "./attachment-list";
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
  attachments: Demand["attachments"];
  history: Demand["history"];
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
        <AttachmentList
          taskId={data.id}
          attachments={data.attachments}
          now={now}
          heading={(n) => (
            <summary>
              Anexos <span className="count">({n})</span>
            </summary>
          )}
        />
      </details>

      <details className="detail-group">
        <summary>
          Histórico <span className="count">({data.history.length})</span>
        </summary>
        <HistoryList history={data.history} now={now} />
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

// T10, proposta A: agrupado por dia, do mais novo ao mais antigo; hora à esquerda, autor e o que mudou.
export function HistoryList({
  history,
  now,
}: {
  history: DetailData["history"];
  now: Date;
}) {
  if (history.length === 0) return <p>Sem alterações.</p>;
  const days: { day: string; items: DetailData["history"][number][] }[] = [];
  for (const h of history) {
    const day = dayLabel(h.at, now);
    if (days.at(-1)?.day === day) days.at(-1)!.items.push(h);
    else days.push({ day, items: [h] });
  }
  return (
    <div className="history">
      {days.map(({ day, items }) => (
        <section key={day}>
          <h3 className="history-day">{day}</h3>
          <ol className="history-list">
            {items.map((h, i) => (
              <li key={h.id ?? `${h.at}-${i}`}>
                {/* A hora sai do fuso de quem vê: no servidor pode ser outro */}
                <time
                  className="history-hour"
                  dateTime={h.at}
                  suppressHydrationWarning
                >
                  {zoned(new Date(h.at)).hour}h
                </time>
                <div>
                  <span className="history-who">
                    {h.mine ? "Você" : h.author}
                  </span>
                  <p className="history-text">{h.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
