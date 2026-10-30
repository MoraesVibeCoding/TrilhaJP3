"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { captureOptions, createDemand } from "@/app/(app)/demandas/actions";
import { findSimilar, validateTitle } from "@/lib/capture";
import { PRIORITIES, type Priority } from "@/lib/demand-labels";
import { useStoredState } from "@/lib/use-stored-state";
import { DemandDialog } from "./demand-dialog";
import { Icon } from "./icon";
import { useFlashMessage } from "@/lib/use-flash-message";

const PREFS_KEY = "trilhajp3-captura";

type SimilarItem = { id: string; title: string };
type Options = {
  projects: { id: string; name: string }[];
  demands: SimilarItem[];
};

function CaptureForm({
  defaultProjectId,
  projects,
  existing,
  onCreate,
}: {
  defaultProjectId: string;
  projects: Options["projects"];
  existing: readonly SimilarItem[];
  // devolve a mensagem de erro, ou null se criou
  onCreate: (input: {
    title: string;
    projectId: string;
    priority: Priority;
  }) => Promise<string | null>;
}) {
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [priority, setPriority] = useState<Priority>("Média");
  const [error, setError] = useState("");
  const [similar, setSimilar] = useState<SimilarItem[] | null>(null);

  function edit(value: string) {
    setTitle(value);
    setError("");
    setSimilar(null); // mudou o título: o aviso antigo não vale mais
  }

  return (
    <form
      className="capture-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;
        const checked = validateTitle(title);
        if (!checked.ok) return setError(checked.error);
        const found =
          similar === null ? findSimilar(checked.title, existing) : [];
        if (found.length > 0) return setSimilar(found);
        setPending(true);
        const failed = await onCreate({
          title: checked.title,
          projectId,
          priority,
        });
        // criou: a janela fecha e este formulário sai da tela
        if (failed) {
          setError(failed);
          setPending(false);
        }
      }}
    >
      <input
        type="text"
        className="capture-input"
        aria-label="Título da demanda"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "capture-error" : undefined}
        placeholder="Escreva a demanda e aperte Enter"
        maxLength={200}
        autoComplete="off"
        // o campo monta depois que os projetos carregam, já com a janela aberta
        autoFocus
        value={title}
        onChange={(e) => edit(e.target.value)}
      />
      {error && (
        <p id="capture-error" role="alert" className="capture-error">
          {error}
        </p>
      )}
      <div className="capture-fields">
        <label className="field">
          Projeto
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
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
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      {similar && (
        <div className="capture-similar">
          <p>Parecida com:</p>
          <ul>
            {similar.map((d) => (
              <li key={d.id}>{d.title}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="capture-actions">
        <span className="capture-hint">
          <kbd>Enter</kbd> cria · <kbd>Esc</kbd> cancela
        </span>
        <button type="submit" className="primary-button" disabled={pending}>
          {pending
            ? "Criando…"
            : similar
              ? "Criar mesmo assim"
              : "Criar demanda"}
        </button>
      </div>
    </form>
  );
}

export function CaptureButton({ prefsKey = PREFS_KEY }: { prefsKey?: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useFlashMessage();
  // null = carregando; "erro" = não carregou
  const [options, setOptions] = useState<Options | null | "erro">(null);
  const [prefs, setPrefs] = useStoredState<{ projectId?: string }>(
    prefsKey,
    {},
  );
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  });

  // atalho C, como o F do modo: não vale digitando, com modificador ou com outra janela aberta
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "c") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (openRef.current || document.querySelector("dialog[open]")) return;
      setOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // A casca é estática: projetos e títulos (para o aviso de parecida) vêm do banco a cada abertura.
  useEffect(() => {
    if (!open) return;
    let current = true;
    captureOptions().then(
      (loaded) => current && setOptions(loaded ?? "erro"),
      () => current && setOptions("erro"),
    );
    return () => {
      current = false;
    };
  }, [open]);

  async function create(input: {
    title: string;
    projectId: string;
    priority: Priority;
  }) {
    const result = await createDemand(input);
    if (!result.ok) return result.error;
    setPrefs({ projectId: input.projectId });
    setOpen(false);
    const project =
      options !== "erro" &&
      options?.projects.find((p) => p.id === input.projectId);
    setMessage(
      `Demanda criada: ${input.title}, em ${project ? project.name : "projeto"}.`,
    );
    return null;
  }

  function form() {
    if (options === null) return <p className="capture-note">Carregando…</p>;
    if (options === "erro")
      return (
        <p className="capture-note" role="alert">
          Não foi possível carregar os projetos. Feche e tente de novo.
        </p>
      );
    if (options.projects.length === 0)
      return (
        <p className="capture-note">
          Toda demanda fica num projeto.{" "}
          <Link href="/projetos" onClick={() => setOpen(false)}>
            Crie o primeiro em Projetos
          </Link>
          .
        </p>
      );
    const remembered = options.projects.find((p) => p.id === prefs.projectId);
    return (
      <CaptureForm
        defaultProjectId={remembered?.id ?? options.projects[0].id}
        projects={options.projects}
        existing={options.demands}
        onCreate={create}
      />
    );
  }

  return (
    <>
      <button
        type="button"
        className="capture-button"
        title="Nova demanda (C)"
        onClick={() => setOpen(true)}
      >
        <Icon name="adicionar" />
        <span className="capture-label">Nova demanda</span>
        <kbd aria-hidden="true">C</kbd>
      </button>
      <DemandDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Nova demanda"
      >
        {open && form()}
      </DemandDialog>
      <p role="status" className="capture-toast">
        {message}
      </p>
    </>
  );
}
