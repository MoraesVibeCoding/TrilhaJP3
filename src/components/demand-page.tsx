"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatDueDate } from "@/lib/demand-labels";
import { demandPath } from "@/lib/demand-url";
import type { Demand } from "@/lib/demand-labels";
import { formatActivity } from "@/lib/resume";
import { useDemandState } from "@/lib/use-demand-state";
import {
  AttachmentList,
  CommentList,
  DetailNow,
  HistoryList,
  NowToggle,
  SubtaskList,
} from "./demand-detail";
import { DemandEditForm } from "./demand-edit-form";
import { useFlashMessage } from "@/lib/use-flash-message";

export type PageDemand = Demand;

export function DemandPage({
  id,
  demands,
  projects,
  now,
}: {
  id: string;
  demands: readonly PageDemand[];
  projects: readonly { id: string; name: string }[];
  now: Date;
}) {
  const { current, conclude, toggleNow, failure } = useDemandState(demands);
  const demand = current.find((d) => d.id === id);
  const [message, setMessage] = useFlashMessage();
  const [editing, setEditing] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);

  // Ao fechar o formulário, o foco volta ao botão que o abriu.
  useEffect(() => {
    if (!editing && wasEditing.current) editButton.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  function copyLink() {
    // sem contexto seguro não há navigator.clipboard: a falha cai na mesma mensagem
    Promise.resolve()
      .then(() =>
        navigator.clipboard.writeText(`${location.origin}${demandPath(id)}`),
      )
      .then(
        () => setMessage("Link copiado."),
        () =>
          setMessage(
            "Não deu para copiar. O endereço está na barra do navegador.",
          ),
      );
  }

  if (!demand)
    return (
      <>
        <h1>Demanda não encontrada.</h1>
        <p className="demand-page-missing">
          <Link href="/demandas">Voltar para Demandas</Link>
        </p>
      </>
    );

  const project =
    projects.find((p) => p.id === demand.projectId)?.name ?? "Sem projeto";
  const comments = demand.comments;
  const attachments = demand.attachments;
  const history = demand.history;

  return (
    <article className="demand-page">
      <p className="demand-page-path">
        <Link href="/demandas">Demandas</Link> / {project}
      </p>
      {editing ? (
        <DemandEditForm
          demand={demand}
          onDone={() => {
            setEditing(false);
            setMessage("Demanda salva.");
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <h1>{demand.title}</h1>
          <div className="demand-page-meta">
            <span className="badge" data-state={demand.state}>
              {demand.state}
            </span>
            <span>{project}</span>
            <span className="meta-dot" aria-hidden="true">
              ·
            </span>
            <span>Prioridade {demand.priority}</span>
            <span className="meta-dot" aria-hidden="true">
              ·
            </span>
            {demand.dueDate && (
              <>
                <span>Prazo {formatDueDate(demand.dueDate, now)}</span>
                <span className="meta-dot" aria-hidden="true">
                  ·
                </span>
              </>
            )}
            <span>
              Última atividade {formatActivity(demand.lastActivityAt, now)}
            </span>
            <span className="demand-page-actions">
              {demand.state !== "Feito" && (
                <NowToggle
                  isNow={!!demand.isNow}
                  onToggle={() => toggleNow(demand.id)}
                />
              )}
              <button
                type="button"
                className="secondary-button"
                ref={editButton}
                onClick={() => setEditing(true)}
              >
                Editar
              </button>
              <button
                type="button"
                className="secondary-button copy-link"
                onClick={copyLink}
              >
                Copiar link
              </button>
            </span>
          </div>
          {demand.description && (
            <p className="demand-page-description">{demand.description}</p>
          )}
        </>
      )}

      <div className="demand-page-cols">
        <section aria-labelledby="dp-subtasks" className="demand-page-steps">
          <h2 id="dp-subtasks">Subtarefas ({demand.subtasks.length})</h2>
          <SubtaskList subtasks={demand.subtasks} label="Subtarefas" />
        </section>

        <div className="demand-page-center">
          <section
            aria-labelledby="dp-now"
            className="detail-now demand-page-now"
          >
            <h2 id="dp-now">Agora</h2>
            <DetailNow
              subtasks={demand.subtasks}
              onConclude={() => conclude(demand.id)}
            />
          </section>
          <section aria-labelledby="dp-comments" className="demand-page-more">
            <h2 id="dp-comments">Comentários ({comments.length})</h2>
            <CommentList comments={comments} />
          </section>
        </div>

        <div className="demand-page-side demand-page-more">
          <section aria-labelledby="dp-attachments">
            <h2 id="dp-attachments">Anexos ({attachments.length})</h2>
            <AttachmentList attachments={attachments} />
          </section>
          <section aria-labelledby="dp-history">
            <h2 id="dp-history">Histórico ({history.length})</h2>
            <HistoryList history={history} />
          </section>
        </div>
      </div>
      <p role="status" className="board-message">
        {message || failure}
      </p>
    </article>
  );
}
