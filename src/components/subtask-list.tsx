"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { validateTitle } from "@/lib/capture";
import { Icon } from "./icon";

type Subtask = { id: string; title: string; done: boolean };

export type SubtaskEditor = {
  add: (title: string) => void;
  rename: (id: string, title: string) => void;
  toggle: (id: string, done: boolean) => void;
  remove: (id: string) => void;
};

const EMPTY = "Escreva o título da subtarefa.";

// Passos da demanda. Com `editor` (T7, proposta C): caixa de marcar, "Mais opções" com Renomear e Remover,
// e "Adicionar subtarefa". Sem ele, só a lista, como nas telas que não editam.
export function SubtaskList({
  subtasks,
  label,
  editor,
}: {
  subtasks: readonly Subtask[];
  label?: string;
  editor?: SubtaskEditor;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const moreRefs = useRef(new Map<string, HTMLButtonElement>());
  const addRef = useRef<HTMLButtonElement>(null);
  const nextIndex = subtasks.findIndex((s) => !s.done);
  // Quem recebe o foco depois que um campo some: decidido no evento, aplicado depois da renderização.
  const focusNext = useRef<(() => HTMLElement | null | undefined) | null>(null);
  useEffect(() => {
    const target = focusNext.current;
    focusNext.current = null;
    target?.()?.focus();
  });

  // Normaliza como a captura; o limite de 200 vem do maxLength do campo e do banco.
  const titleOf = (raw: string) => {
    const t = validateTitle(raw);
    setError(t.ok ? "" : EMPTY);
    return t.ok ? t.title : null;
  };

  function finishRename(s: Subtask, field: HTMLInputElement, save: boolean) {
    if (save) {
      const title = titleOf(field.value);
      if (!title) return;
      if (title !== s.title) editor?.rename(s.id, title);
    } else setError("");
    setEditing(null);
    focusNext.current = () => moreRefs.current.get(s.id);
  }

  function onRenameKey(s: Subtask, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault(); // senão o mesmo Enter aciona o botão que recebe o foco
      finishRename(s, e.currentTarget, true);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      finishRename(s, e.currentTarget, false);
    }
  }

  function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const field = e.currentTarget.elements.namedItem(
      "title",
    ) as HTMLInputElement;
    const title = titleOf(field.value);
    if (!title) return;
    editor?.add(title);
    field.value = "";
  }

  const list =
    subtasks.length === 0 ? (
      <p>Nenhuma subtarefa.</p>
    ) : (
      <ol
        className="detail-list"
        aria-label={label}
        data-editable={editor ? "" : undefined}
      >
        {subtasks.map((s, i) => (
          <li
            key={s.id}
            data-done={s.done}
            aria-current={i === nextIndex ? "step" : undefined}
          >
            {editor && (
              <label className="step-check">
                <input
                  type="checkbox"
                  checked={s.done}
                  aria-label={`Marcar ${s.title} como ${s.done ? "não feita" : "feita"}`}
                  onChange={(e) => editor.toggle(s.id, e.target.checked)}
                />
              </label>
            )}
            {editing === s.id ? (
              <input
                className="step-field"
                defaultValue={s.title}
                maxLength={200}
                aria-label={`Novo título de ${s.title}`}
                autoFocus
                onKeyDown={(e) => onRenameKey(s, e)}
              />
            ) : (
              <span className="step-title">
                {s.title}
                {s.done && <span className="detail-meta"> feito</span>}
                {i === nextIndex && <span className="detail-meta"> agora</span>}
              </span>
            )}
            {editor && editing !== s.id && (
              <span className="step-more">
                <button
                  type="button"
                  className="step-button"
                  aria-expanded={open === s.id}
                  aria-label={`Mais opções para ${s.title}`}
                  ref={(el) => {
                    if (el) moreRefs.current.set(s.id, el);
                    else moreRefs.current.delete(s.id);
                  }}
                  onClick={() => setOpen(open === s.id ? null : s.id)}
                >
                  <Icon name="mais-opcoes" />
                </button>
                {open === s.id && (
                  <span className="step-options">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(null);
                        setEditing(s.id);
                      }}
                    >
                      <Icon name="editar" size={18} />
                      Renomear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(null);
                        editor.remove(s.id);
                        focusNext.current = () => addRef.current;
                      }}
                    >
                      <Icon name="excluir" size={18} />
                      Remover
                    </button>
                  </span>
                )}
              </span>
            )}
          </li>
        ))}
      </ol>
    );

  if (!editor) return list;
  return (
    <>
      {list}
      {adding ? (
        <form className="step-add" onSubmit={onAdd}>
          <input
            name="title"
            className="step-field"
            placeholder="Nova subtarefa"
            aria-label="Nova subtarefa"
            maxLength={200}
            autoFocus
            onKeyDown={(e) => {
              if (e.key !== "Escape") return;
              e.preventDefault();
              setAdding(false);
              setError("");
              focusNext.current = () => addRef.current;
            }}
          />
          <button type="submit" className="secondary-button">
            <Icon name="adicionar" size={18} />
            Adicionar
          </button>
        </form>
      ) : (
        <button
          type="button"
          ref={addRef}
          className="secondary-button step-add-button"
          onClick={() => setAdding(true)}
        >
          <Icon name="adicionar" size={18} />
          Adicionar subtarefa
        </button>
      )}
      <p role="alert" className="step-error">
        {error}
      </p>
    </>
  );
}
