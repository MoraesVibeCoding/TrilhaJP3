"use client";

// T5.3, proposta A: "Editar" abre o cabeçalho da página inteira como formulário, no padrão de Projetos.
import { useActionState, useEffect, useId, useRef } from "react";
import { updateDemand } from "@/app/(app)/demandas/actions";
import { PRIORITY_LABELS, priorityValue } from "@/lib/demand-labels";
import type { DemandField } from "@/lib/demand-input";
import type { DemoDemand } from "@/lib/demo-data";

export function DemandEditForm({
  demand,
  onDone,
  onCancel,
}: {
  demand: DemoDemand;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(updateDemand, undefined);
  const prefix = useId();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "saved" in state) onDone();
  }, [state, onDone]);

  const errors = state && "errors" in state ? state.errors : {};
  // Erro de campo: o foco vai ao primeiro campo inválido.
  useEffect(() => {
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state]);

  const values = state && "values" in state ? state.values : undefined;
  const initial: Record<DemandField, string> = {
    title: demand.title,
    description: demand.description ?? "",
    priority: priorityValue(demand.priority) ?? "medium",
    due_date: demand.dueDate ?? "",
  };
  const value = (field: DemandField) => values?.[field] ?? initial[field];

  // Erro fora do rótulo (o nome do campo continua "Título") e ligado a ele por aria-describedby.
  const fieldProps = (field: DemandField) => ({
    name: field,
    id: `${prefix}-${field}`,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${prefix}-${field}-erro` : undefined,
  });
  const fieldError = (field: DemandField) =>
    errors[field] && (
      <span id={`${prefix}-${field}-erro`} className="project-field-error">
        {errors[field]}
      </span>
    );

  return (
    <form
      ref={formRef}
      className="project-form demand-edit"
      action={action}
      aria-label="Editar demanda"
    >
      {errors.form && (
        <p className="project-form-error" role="alert">
          {errors.form}
        </p>
      )}
      <input type="hidden" name="id" value={demand.id} />
      <div className="login-field project-field-wide">
        <label className="project-label">
          Título
          <input
            className="login-input demand-edit-title"
            defaultValue={value("title")}
            required
            maxLength={200}
            autoFocus
            {...fieldProps("title")}
          />
        </label>
        {fieldError("title")}
      </div>
      <div className="login-field project-field-wide">
        <label className="project-label">
          Descrição
          <textarea
            className="login-input"
            rows={3}
            maxLength={5000}
            defaultValue={value("description")}
            {...fieldProps("description")}
          />
        </label>
        {fieldError("description")}
      </div>
      <div className="login-field">
        <label className="project-label">
          Prioridade
          <select
            className="login-input"
            defaultValue={value("priority")}
            {...fieldProps("priority")}
          >
            {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {fieldError("priority")}
      </div>
      <div className="login-field">
        <label className="project-label">
          Prazo
          <input
            className="login-input"
            type="date"
            defaultValue={value("due_date")}
            {...fieldProps("due_date")}
          />
        </label>
        {fieldError("due_date")}
      </div>
      <div className="project-form-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="primary-button" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
