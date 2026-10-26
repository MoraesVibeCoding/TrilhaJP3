"use client";

import { useState } from "react";
import type { ProjectGroup } from "@/lib/project-groups";
import { StepProgress } from "./step-progress";
import { DEMAND_STATES as STATES } from "@/lib/demo-data";

const PREVIEW = 2;

export function ProjectCards({
  groups,
  onOpen,
}: {
  groups: readonly ProjectGroup[];
  onOpen: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <ul aria-label="Projetos" className="project-cards">
      {groups.map((g) => {
        const open = expanded.has(g.id);
        const shown = open ? g.items : g.items.slice(0, PREVIEW);
        const hidden = g.items.length - PREVIEW;
        return (
          <li key={g.id} className="project-card">
            <h2>{g.name}</h2>
            <p className="project-counts">
              {STATES.map((s) => (
                <span key={s}>
                  <b>{g.counts[s]}</b> {s}
                </span>
              ))}
            </p>
            <p className="project-progress">
              <StepProgress done={g.done} total={g.total} />
              {g.total > 0 && (
                <span>
                  {g.done} de {g.total}{" "}
                  {g.total === 1 ? "demanda feita" : "demandas feitas"}
                </span>
              )}
            </p>
            {g.total === 0 ? (
              <p className="resume-empty">Sem demandas ainda.</p>
            ) : g.items.length === 0 ? (
              <p className="resume-empty">Nenhuma com esse estado.</p>
            ) : (
              <ul className="project-items">
                {shown.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      className="resume-open"
                      onClick={() => onOpen(r.id)}
                    >
                      {r.title}
                    </button>
                    <span className="badge" data-state={r.state}>
                      {r.state}
                    </span>
                    <span className="resume-project">{r.priority}</span>
                    {r.subtasksTotal > 0 && (
                      <span className="resume-next">
                        {r.nextSubtask
                          ? `Próxima: ${r.nextSubtask}`
                          : "Sem subtarefas pendentes"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {hidden > 0 && (
              <button
                type="button"
                className="project-more"
                aria-expanded={open}
                aria-label={
                  open
                    ? `Ver menos demandas de ${g.name}`
                    : `Ver mais ${hidden} demandas de ${g.name}`
                }
                onClick={() => toggle(g.id)}
              >
                {open ? "Ver menos" : `Ver mais ${hidden}`}
              </button>
            )}
          </li>
        );
      })}
      {groups.length > 5 && (
        <li className="focus-note">
          Mostrando os 5 primeiros de {groups.length} projetos. Volte ao modo
          Completo para ver todos.
        </li>
      )}
    </ul>
  );
}
