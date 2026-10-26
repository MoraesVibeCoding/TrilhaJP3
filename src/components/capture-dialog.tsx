"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildDemand,
  findSimilar,
  MAX_CAPTURED,
  validateTitle,
  type CapturedDemand,
} from "@/lib/capture";
import {
  demoDemands,
  demoProjects,
  PRIORITIES,
  type Priority,
} from "@/lib/demo-data";
import { CAPTURED_STORAGE, useCapturedDemands } from "@/lib/use-captured";
import { useStoredState } from "@/lib/use-stored-state";
import { DemandDialog } from "./demand-dialog";
import { useFlashMessage } from "@/lib/use-flash-message";

const PREFS_KEY = "trilhajp3-captura";

type SimilarItem = { id: string; title: string };

function CaptureForm({
  defaultProjectId,
  existing,
  onCreate,
}: {
  defaultProjectId: string;
  existing: readonly SimilarItem[];
  onCreate: (input: {
    title: string;
    projectId: string;
    priority: Priority;
  }) => void;
}) {
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
      onSubmit={(event) => {
        event.preventDefault();
        const checked = validateTitle(title);
        if (!checked.ok) return setError(checked.error);
        const found =
          similar === null ? findSimilar(checked.title, existing) : [];
        if (found.length > 0) return setSimilar(found);
        onCreate({ title: checked.title, projectId, priority });
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
        data-autofocus
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
            {demoProjects.map((p) => (
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
        <button type="submit" className="primary-button">
          {similar ? "Criar mesmo assim" : "Criar demanda"}
        </button>
      </div>
    </form>
  );
}

export function CaptureButton({
  capturedKey = CAPTURED_STORAGE,
  prefsKey = PREFS_KEY,
}: {
  capturedKey?: string;
  prefsKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useFlashMessage();
  const [captured, add] = useCapturedDemands(capturedKey);
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

  const remembered = demoProjects.find((p) => p.id === prefs.projectId);
  const existing: SimilarItem[] = [...demoDemands, ...captured];

  function create(input: {
    title: string;
    projectId: string;
    priority: Priority;
  }) {
    // a leitura descarta o que passa do limite: gravar a 501ª a perderia em silêncio
    if (captured.length >= MAX_CAPTURED) {
      setOpen(false);
      setMessage(
        `Não deu para criar: este navegador já guarda ${MAX_CAPTURED} demandas, o limite até os dados irem para o banco.`,
      );
      return;
    }
    const demand: CapturedDemand = buildDemand({
      id: `c-${crypto.randomUUID()}`,
      ...input,
      now: new Date(),
    });
    add(demand);
    setPrefs({ projectId: input.projectId });
    setOpen(false);
    const project = demoProjects.find((p) => p.id === input.projectId);
    setMessage(
      `Demanda criada: ${input.title}, em ${project?.name ?? "projeto"}.`,
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
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="capture-label">Nova demanda</span>
        <kbd aria-hidden="true">C</kbd>
      </button>
      <DemandDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Nova demanda"
      >
        {open && (
          <CaptureForm
            defaultProjectId={remembered?.id ?? demoProjects[0].id}
            existing={existing}
            onCreate={create}
          />
        )}
      </DemandDialog>
      <p role="status" className="capture-toast">
        {message}
      </p>
    </>
  );
}
