"use client";

// Página Projetos (T4), proposta A: grupos por estado; editar abre a própria linha como formulário.
import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import {
  createProject,
  setArchived,
  updateProject,
} from "@/app/(app)/projetos/actions";
import { useFlashMessage } from "@/lib/use-flash-message";
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  type ProjectField,
  type ProjectStatusValue,
} from "@/lib/project-input";
import type { Project } from "@/lib/projects";

const GROUP_ORDER: ProjectStatusValue[] = [
  "in_progress",
  "idea",
  "paused",
  "done",
];

// Só o domínio e o caminho: "https://" repetido em toda linha é ruído.
const shortLink = (link: string) => link.replace(/^https:\/\//, "");

export function ProjectList({
  projects,
  showArchived,
}: {
  projects: Project[];
  showArchived: boolean;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useFlashMessage();
  const active = projects.filter((p) => !p.archived_at);
  const archived = projects.filter((p) => p.archived_at);
  const lastClosed = useRef<string | null>(null);

  // Ao fechar o formulário, o foco volta ao botão que o abriu.
  useEffect(() => {
    if (editing !== null || !lastClosed.current) return;
    document.getElementById(`editar-${lastClosed.current}`)?.focus();
    lastClosed.current = null;
  }, [editing]);

  function close(id: string, note?: string) {
    lastClosed.current = id;
    setEditing(null);
    if (note) setMessage(note);
  }

  return (
    <>
      <div className="page-head">
        <h1>Projetos</h1>
        {!showArchived && editing !== "novo" && (
          <button
            type="button"
            className="primary-button"
            id="editar-novo"
            onClick={() => setEditing("novo")}
          >
            Novo projeto
          </button>
        )}
      </div>

      <nav className="project-tabs" aria-label="Filtro de projetos">
        <Link href="/projetos" aria-current={showArchived ? undefined : "page"}>
          Ativos ({active.length})
        </Link>
        <Link
          href="/projetos?arquivados=1"
          aria-current={showArchived ? "page" : undefined}
        >
          Arquivados ({archived.length})
        </Link>
      </nav>

      {editing === "novo" && (
        <ProjectForm
          onDone={(note) => close("novo", note)}
          onCancel={() => close("novo")}
        />
      )}

      {showArchived ? (
        <ArchivedList projects={archived} onRestored={setMessage} />
      ) : active.length === 0 ? (
        editing !== "novo" && (
          <p className="project-empty">
            Nenhum projeto ainda. Crie o primeiro em Novo projeto.
          </p>
        )
      ) : (
        GROUP_ORDER.map((status) => {
          const group = active.filter((p) => p.status === status);
          if (group.length === 0) return null;
          return (
            <section key={status} className="project-group">
              <h2>
                {PROJECT_STATUSES[status]}
                <span className="project-count">{group.length}</span>
              </h2>
              <ul>
                {group.map((project) => (
                  <li key={project.id}>
                    {editing === project.id ? (
                      <ProjectForm
                        project={project}
                        onDone={(note) => close(project.id, note)}
                        onCancel={() => close(project.id)}
                      />
                    ) : (
                      <ProjectRow
                        project={project}
                        onEdit={() => setEditing(project.id)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      <p className="board-message" role="status">
        {message}
      </p>
    </>
  );
}

function ProjectRow({
  project,
  onEdit,
}: {
  project: Project;
  onEdit: () => void;
}) {
  return (
    <div className="project-row">
      <strong className="project-name">{project.name}</strong>
      <span className="project-meta">
        <span className="visually-hidden">Prioridade </span>
        {PROJECT_PRIORITIES[project.priority]}
      </span>
      {project.link ? (
        <a
          className="project-link"
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {shortLink(project.link)}
        </a>
      ) : (
        <span className="project-meta">Sem link</span>
      )}
      <button
        type="button"
        className="secondary-button"
        id={`editar-${project.id}`}
        aria-label={`Editar ${project.name}`}
        onClick={onEdit}
      >
        Editar
      </button>
    </div>
  );
}

function ArchivedList({
  projects,
  onRestored,
}: {
  projects: Project[];
  onRestored: (note: string) => void;
}) {
  if (projects.length === 0)
    return <p className="project-empty">Nenhum projeto arquivado.</p>;
  return (
    <ul className="project-group">
      {projects.map((project) => (
        <li key={project.id}>
          <form
            className="project-row project-row-archived"
            action={async (form) => {
              onRestored(
                (await setArchived(form))
                  ? `“${project.name}” voltou para Ativos.`
                  : "Não foi possível restaurar. Tente de novo.",
              );
            }}
          >
            <strong className="project-name">{project.name}</strong>
            <span className="project-meta">
              {PROJECT_STATUSES[project.status]}
            </span>
            <input type="hidden" name="id" value={project.id} />
            <input type="hidden" name="archived" value="false" />
            <button
              type="submit"
              className="secondary-button"
              aria-label={`Restaurar ${project.name}`}
            >
              Restaurar
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

function ProjectForm({
  project,
  onDone,
  onCancel,
}: {
  project?: Project;
  onDone: (note: string) => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    project ? updateProject : createProject,
    undefined,
  );
  const prefix = useId();
  const [archiveFailed, setArchiveFailed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const title = project ? `Editar ${project.name}` : "Novo projeto";

  useEffect(() => {
    if (state && "saved" in state) onDone("Projeto salvo.");
  }, [state, onDone]);

  const errors = state && "errors" in state ? state.errors : {};

  // Erro de campo: o foco vai ao primeiro campo inválido, e o leitor de tela lê o rótulo e a mensagem.
  useEffect(() => {
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state]);
  const values = state && "values" in state ? state.values : undefined;
  const value = (field: ProjectField) =>
    values?.[field] ?? project?.[field] ?? undefined;

  // Erro fora do rótulo (o nome do campo continua "Nome") e ligado a ele por aria-describedby.
  const fieldProps = (field: ProjectField) => ({
    name: field,
    id: `${prefix}-${field}`,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${prefix}-${field}-erro` : undefined,
  });
  const fieldError = (field: ProjectField) =>
    errors[field] && (
      <span id={`${prefix}-${field}-erro`} className="project-field-error">
        {errors[field]}
      </span>
    );

  return (
    <form
      ref={formRef}
      className="project-form"
      action={action}
      aria-label={title}
    >
      {(errors.form || archiveFailed) && (
        <p className="project-form-error" role="alert">
          {errors.form ?? "Não foi possível arquivar. Tente de novo."}
        </p>
      )}
      {project && <input type="hidden" name="id" value={project.id} />}
      <div className="login-field project-field-name">
        <label className="project-label">
          Nome
          <input
            className="login-input"
            defaultValue={value("name") ?? ""}
            required
            maxLength={120}
            autoFocus
            {...fieldProps("name")}
          />
        </label>
        {fieldError("name")}
      </div>
      <div className="login-field">
        <label className="project-label">
          Estado
          <select
            className="login-input"
            defaultValue={value("status") ?? "idea"}
            {...fieldProps("status")}
          >
            {Object.entries(PROJECT_STATUSES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {fieldError("status")}
      </div>
      <div className="login-field">
        <label className="project-label">
          Prioridade
          <select
            className="login-input"
            defaultValue={value("priority") ?? "medium"}
            {...fieldProps("priority")}
          >
            {Object.entries(PROJECT_PRIORITIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {fieldError("priority")}
      </div>
      <div className="login-field project-field-wide">
        <label className="project-label">
          Descrição
          <textarea
            className="login-input"
            rows={3}
            maxLength={2000}
            defaultValue={value("description") ?? ""}
            {...fieldProps("description")}
          />
        </label>
        {fieldError("description")}
      </div>
      <div className="login-field project-field-wide">
        <label className="project-label">
          Link
          <input
            className="login-input"
            type="url"
            inputMode="url"
            placeholder="https://"
            defaultValue={value("link") ?? ""}
            {...fieldProps("link")}
          />
        </label>
        {fieldError("link")}
      </div>
      <div className="project-form-actions">
        {project && (
          <>
            <input type="hidden" name="archived" value="true" />
            <button
              type="submit"
              className="secondary-button project-archive"
              formAction={async (form) => {
                if (await setArchived(form))
                  onDone(`“${project.name}” foi para Arquivados.`);
                else setArchiveFailed(true);
              }}
            >
              Arquivar
            </button>
          </>
        )}
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="primary-button" disabled={pending}>
          {pending ? "Salvando…" : project ? "Salvar" : "Criar projeto"}
        </button>
      </div>
    </form>
  );
}
