"use client";

import { useDemandState } from "@/lib/use-demand-state";
import { useStoredState } from "@/lib/use-stored-state";
import {
  buildRows,
  filterRows,
  sortRows,
  type DemandInput,
  type SortKey,
} from "@/lib/demands-view";
import { formatActivity } from "@/lib/resume";
import { groupByProject } from "@/lib/project-groups";
import { ProjectCards } from "./project-cards";
import { useWithCaptured } from "@/lib/use-captured";
import { BoardColumns } from "./board-columns";
import { DemandDetail } from "./demand-detail";
import { DemandDialog } from "./demand-dialog";
import { demandPath, useOpenDemand } from "@/lib/demand-url";
import { DEMAND_STATES as STATES, PRIORITIES } from "@/lib/demo-data";

export type DemandsDemand = DemandInput & {
  comments: readonly { author: string; at: string; text: string }[];
  attachments: readonly { name: string }[];
  history: readonly { at: string; text: string }[];
  isNow?: boolean;
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "title", label: "Demanda" },
  { key: "project", label: "Projeto" },
  { key: "state", label: "Estado" },
  { key: "priority", label: "Prioridade" },
  { key: "activity", label: "Atividade" },
];
const LAYOUTS: { id: Layout; label: string }[] = [
  { id: "table", label: "Tabela" },
  { id: "projects", label: "Por projeto" },
  { id: "board", label: "Quadro" },
];
const SORT_KEYS = COLUMNS.map((c) => c.key);

type Layout = "table" | "projects" | "board";
type ViewState = {
  layout: Layout;
  project: string;
  state: string;
  priority: string;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
};
const DEFAULT_VIEW: ViewState = {
  layout: "table",
  project: "",
  state: "",
  priority: "",
  sortKey: "priority",
  sortDir: "desc",
};

// O que vem do navegador não é confiável: valores fora da lista voltam ao padrão.
function sanitize(v: Partial<ViewState>): ViewState {
  return {
    layout: LAYOUTS.some((l) => l.id === v.layout)
      ? (v.layout as Layout)
      : "table",
    project: typeof v.project === "string" ? v.project : "",
    state: STATES.includes(v.state as never) ? (v.state as string) : "",
    priority: PRIORITIES.includes(v.priority as never)
      ? (v.priority as string)
      : "",
    sortKey: SORT_KEYS.includes(v.sortKey as SortKey)
      ? (v.sortKey as SortKey)
      : DEFAULT_VIEW.sortKey,
    sortDir: v.sortDir === "asc" || v.sortDir === "desc" ? v.sortDir : "desc",
  };
}

function Caret({ dir }: { dir: "asc" | "desc" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: dir === "asc" ? "rotate(180deg)" : undefined }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function DemandsBoard({
  demands,
  projects,
  now,
  storageName = "trilhajp3-demandas",
}: {
  demands: readonly DemandsDemand[];
  projects: readonly { id: string; name: string }[];
  now: Date;
  storageName?: string;
}) {
  const { current, conclude, moveTo, toggleNow, failure } = useDemandState(
    useWithCaptured(demands),
  );
  const [stored, setStored] = useStoredState<Partial<ViewState>>(
    storageName,
    DEFAULT_VIEW,
  );
  const view = sanitize(stored);
  const [openId, openDemand, closeDemand] = useOpenDemand();

  const rows = buildRows(current, projects);
  const visible = sortRows(
    filterRows(rows, {
      project: view.project,
      // no Quadro as colunas já são os estados; um estado salvo da Tabela não vale aqui
      state: view.layout === "board" ? "" : (view.state as never),
      priority: view.priority as never,
    }),
    { key: view.sortKey, dir: view.sortDir },
  );
  const open = current.find((d) => d.id === openId) ?? null;
  // As contagens seguem Projeto e Prioridade; o próprio estado não entra, senão só um zeraria os outros.
  const forCounts = filterRows(rows, {
    project: view.project,
    state: "",
    priority: view.priority as never,
  });
  const countOf = (state: string) =>
    forCounts.filter((r) => r.state === state).length;
  const filtered = Boolean(
    view.project || (view.layout !== "board" && view.state) || view.priority,
  );

  const update = (patch: Partial<ViewState>) =>
    setStored({ ...view, ...patch });

  function sortBy(key: SortKey) {
    if (view.sortKey === key) {
      update({ sortDir: view.sortDir === "asc" ? "desc" : "asc" });
    } else {
      update({
        sortKey: key,
        sortDir: key === "priority" || key === "activity" ? "desc" : "asc",
      });
    }
  }

  if (rows.length === 0) {
    return (
      <>
        <nav aria-label="Visões" className="view-tabs">
          <span aria-current="page">Tabela</span>
        </nav>
        <p className="resume-empty">Nenhuma demanda ainda.</p>
      </>
    );
  }

  return (
    <>
      <div role="group" aria-label="Visões" className="view-tabs">
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={view.layout === l.id}
            onClick={() => update({ layout: l.id })}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="toolbar">
        {view.layout !== "board" && (
          <div
            role="group"
            aria-label="Filtrar por estado"
            className="state-counts"
          >
            {STATES.map((state) => (
              <button
                key={state}
                type="button"
                className="state-count"
                aria-pressed={view.state === state}
                onClick={() =>
                  update({ state: view.state === state ? "" : state })
                }
              >
                <b>{countOf(state)}</b> {state}
              </button>
            ))}
          </div>
        )}

        <div className="filters">
          <label className="field">
            Projeto
            <select
              value={view.project}
              onChange={(e) => update({ project: e.target.value })}
            >
              <option value="">Todos</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Prioridade
            <select
              value={view.priority}
              onChange={(e) => update({ priority: e.target.value })}
            >
              <option value="">Todas</option>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label
            className={`field sort-field${view.layout === "table" ? "" : " sort-field--always"}`}
          >
            Ordenar por
            <select
              value={`${view.sortKey}:${view.sortDir}`}
              onChange={(e) => {
                const [sortKey, sortDir] = e.target.value.split(":");
                update({
                  sortKey: sortKey as SortKey,
                  sortDir: sortDir as "asc" | "desc",
                });
              }}
            >
              <option value="priority:desc">Prioridade</option>
              <option value="activity:desc">Atividade recente</option>
              <option value="title:asc">Demanda (A a Z)</option>
              <option value="project:asc">Projeto</option>
              <option value="state:asc">Estado</option>
            </select>
          </label>
          {filtered && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => update({ project: "", state: "", priority: "" })}
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <p className="demands-count" aria-live="polite">
        Mostrando {visible.length} de {rows.length}
      </p>
      {view.layout === "table" && visible.length > 5 && (
        <p className="focus-note">
          Mostrando as 5 primeiras de {visible.length}. Volte ao modo Completo
          para ver todas.
        </p>
      )}

      {visible.length === 0 ? (
        <p className="resume-empty">Nenhuma demanda com esses filtros.</p>
      ) : view.layout === "board" ? (
        <BoardColumns rows={visible} onOpen={openDemand} onMove={moveTo} />
      ) : view.layout === "projects" ? (
        <ProjectCards
          groups={groupByProject(visible, forCounts, projects, !filtered)}
          onOpen={openDemand}
        />
      ) : (
        <>
          <div className="demands-table-wrap">
            <table className="demands-table">
              <caption className="visually-hidden">Demandas</caption>
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      aria-sort={
                        view.sortKey === c.key
                          ? view.sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : undefined
                      }
                    >
                      <button
                        type="button"
                        className="sort-button"
                        onClick={() => sortBy(c.key)}
                      >
                        {c.label}
                        {view.sortKey === c.key && <Caret dir={view.sortDir} />}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <button
                        type="button"
                        className="resume-open"
                        onClick={() => openDemand(r.id)}
                      >
                        {r.title}
                      </button>
                    </td>
                    <td className="soft">{r.projectName}</td>
                    <td>
                      <span className="badge" data-state={r.state}>
                        {r.state}
                      </span>
                    </td>
                    <td>{r.priority}</td>
                    <td className="soft">
                      {formatActivity(r.lastActivityAt, now)}
                      {r.subtasksTotal > 0 && (
                        <span className="detail-meta block">
                          {r.subtasksDone} de {r.subtasksTotal} subtarefas
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul aria-label="Demandas em cartões" className="demand-cards">
            {visible.map((r) => (
              <li key={r.id} className="demand-card">
                <div className="demand-card-head">
                  <button
                    type="button"
                    className="resume-open"
                    onClick={() => openDemand(r.id)}
                  >
                    {r.title}
                  </button>
                  <span className="badge" data-state={r.state}>
                    {r.state}
                  </span>
                </div>
                <p className="resume-project">
                  {r.projectName} · {r.priority} ·{" "}
                  {formatActivity(r.lastActivityAt, now)}
                </p>
                {r.subtasksTotal > 0 && (
                  <p className="resume-next">
                    {r.nextSubtask
                      ? `Próxima: ${r.nextSubtask}`
                      : "Sem subtarefas pendentes"}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <DemandDialog
        open={open !== null}
        onClose={closeDemand}
        title={open?.title ?? ""}
        pageHref={open ? demandPath(open.id) : undefined}
      >
        {open && (
          <DemandDetail
            data={open}
            subtasks={open.subtasks}
            isNow={Boolean(open.isNow)}
            onConclude={conclude}
            onToggleNow={toggleNow}
          />
        )}
      </DemandDialog>
      <p role="alert" className="board-message">
        {failure}
      </p>
    </>
  );
}
