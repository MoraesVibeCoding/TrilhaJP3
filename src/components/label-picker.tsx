"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useId,
  useOptimistic,
  useRef,
  useState,
} from "react";
import {
  applyLabel,
  removeLabel,
  setLabelColor,
} from "@/app/(app)/demandas/actions";
import {
  LABEL_COLORS,
  sameName,
  validateLabelName,
  type Label,
} from "@/lib/labels";
import { useFlashMessage } from "@/lib/use-flash-message";
import { closeOnBlur, useOutsideClose } from "@/lib/use-outside-close";
import { Icon } from "./icon";

type View = { applied: readonly Label[]; all: readonly Label[] };
type Change =
  { apply: Label } | { remove: string } | { color: string; id: string };

const FAILED = "Não foi possível salvar. Tente de novo.";
// Etiqueta criada agora: até a demanda recarregar do banco ela não tem id real para gravar.
const PROVISIONAL = "novo-";
const byName = (a: Label, b: Label) => a.name.localeCompare(b.name, "pt-BR");

function change(view: View, c: Change): View {
  if ("apply" in c) {
    const known = view.all.some((l) => l.id === c.apply.id);
    return {
      applied: [...view.applied, c.apply].toSorted(byName),
      all: known ? view.all : [...view.all, c.apply].toSorted(byName),
    };
  }
  if ("remove" in c)
    return { ...view, applied: view.applied.filter((l) => l.id !== c.remove) };
  const paint = (l: Label) =>
    l.id === c.id ? { ...l, color: c.color as Label["color"] } : l;
  return { applied: view.applied.map(paint), all: view.all.map(paint) };
}

// T8, proposta B: a linha mostra as etiquetas aplicadas; "Etiquetas" abre o painel com todas as da
// empresa em caixas de marcar, as cores de cada uma e um campo para buscar ou criar.
export function LabelPicker({
  taskId,
  applied,
  all,
}: {
  taskId: string;
  applied: readonly Label[];
  all: readonly Label[];
}) {
  const [view, apply] = useOptimistic({ applied, all }, change);
  const [failure, setFailure] = useFlashMessage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const rowRef = useRef<HTMLDivElement>(null);
  const dismiss = useCallback(() => setOpen(false), []);
  useOutsideClose(rowRef, open, dismiss);
  // Foco depois de fechar o painel: decidido no evento, aplicado depois da renderização.
  const focusButton = useRef(false);
  useEffect(() => {
    if (open) fieldRef.current?.focus();
    else if (focusButton.current) buttonRef.current?.focus();
    focusButton.current = false;
  }, [open]);

  function run(c: Change, save: () => Promise<unknown>) {
    startTransition(async () => {
      apply(c);
      if (!(await save())) setFailure(FAILED);
    });
  }

  const isApplied = (id: string) => view.applied.some((l) => l.id === id);
  const toggle = (l: Label) =>
    isApplied(l.id)
      ? run({ remove: l.id }, () => removeLabel(taskId, l.id))
      : run({ apply: l }, () => applyLabel(taskId, l.name));

  const typed = validateLabelName(query);
  const shown = view.all.filter(
    (l) =>
      !query.trim() ||
      l.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const exact = typed.ok
    ? view.all.find((l) => sameName(l.name, typed.name))
    : undefined;

  function submit() {
    if (!typed.ok) return;
    if (exact) {
      if (!isApplied(exact.id)) toggle(exact);
    } else {
      const created: Label = {
        id: `${PROVISIONAL}${typed.name}`,
        name: typed.name,
        color: "nevoa",
      };
      run({ apply: created }, () => applyLabel(taskId, typed.name));
    }
    setQuery("");
  }

  function close() {
    focusButton.current = true;
    setOpen(false);
    setQuery("");
  }

  return (
    <div
      ref={rowRef}
      className="label-row"
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !open) return;
        // Senão o Esc chega à janela modal e fecha a demanda inteira.
        e.preventDefault();
        e.stopPropagation();
        close();
      }}
      onBlur={(e) => open && closeOnBlur(e, dismiss)}
    >
      <span className="label-row-title">Etiquetas</span>
      {view.applied.length === 0 ? (
        <span className="label-none">Nenhuma</span>
      ) : (
        <ul className="label-list" aria-label="Etiquetas aplicadas">
          {view.applied.map((l) => (
            <li key={l.id} className="label-tag" data-color={l.color}>
              {l.name}
            </li>
          ))}
        </ul>
      )}
      <span className="label-pop">
        <button
          type="button"
          ref={buttonRef}
          className="secondary-button label-button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => (open ? close() : setOpen(true))}
        >
          <Icon name="etiqueta" size={18} />
          Etiquetas
        </button>
        {open && (
          <div className="label-panel" id={panelId}>
            <input
              ref={fieldRef}
              className="step-field"
              value={query}
              maxLength={40}
              placeholder="Buscar ou criar"
              aria-label="Buscar ou criar etiqueta"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                submit();
              }}
            />
            <div role="group" aria-label="Etiquetas da empresa">
              {shown.map((l) => (
                <div key={l.id} className="label-option">
                  <label className="label-check">
                    <input
                      type="checkbox"
                      checked={isApplied(l.id)}
                      disabled={l.id.startsWith(PROVISIONAL)}
                      aria-label={l.name}
                      onChange={() => toggle(l)}
                    />
                    <span className="label-tag" data-color={l.color}>
                      {l.name}
                    </span>
                  </label>
                  <span
                    className="label-colors"
                    role="group"
                    aria-label={`Cor de ${l.name}`}
                  >
                    {LABEL_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className="label-dot"
                        data-color={c.value}
                        aria-label={c.label}
                        aria-pressed={l.color === c.value}
                        disabled={l.id.startsWith(PROVISIONAL)}
                        onClick={() =>
                          l.color !== c.value &&
                          run({ id: l.id, color: c.value }, () =>
                            setLabelColor(l.id, c.value),
                          )
                        }
                      />
                    ))}
                  </span>
                </div>
              ))}
            </div>
            {typed.ok && !exact && (
              <button type="button" className="label-create" onClick={submit}>
                Criar “{typed.name}”
                <span className="detail-meta" aria-hidden="true">
                  Névoa
                </span>
              </button>
            )}
          </div>
        )}
      </span>
      <p role="alert" className="step-error">
        {failure}
      </p>
    </div>
  );
}
