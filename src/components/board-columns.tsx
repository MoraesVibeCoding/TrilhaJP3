"use client";

import { useRef } from "react";
import type { DemandRow } from "@/lib/demands-view";
import { useFlashMessage } from "@/lib/use-flash-message";
import { DEMAND_STATES as STATES } from "@/lib/demand-labels";

export function BoardColumns({
  rows,
  onOpen,
  onMove,
}: {
  rows: readonly DemandRow[];
  onOpen: (id: string) => void;
  onMove: (id: string, state: string) => void;
}) {
  const [message, setMessage] = useFlashMessage();
  // o cartão remonta na coluna nova; sem isto o foco do teclado cairia no corpo da página
  const pendingFocus = useRef<string | null>(null);

  return (
    <>
      <div className="board-columns">
        {STATES.map((state) => {
          const items = rows.filter((r) => r.state === state);
          return (
            <section key={state} className="board-column" data-state={state}>
              <h2>
                <b>{items.length}</b> {state}
              </h2>
              {items.length === 0 ? (
                <p className="resume-empty">Nenhuma demanda em {state}.</p>
              ) : (
                <ul className="board-cards">
                  {items.map((r) => (
                    <li key={r.id} className="board-card">
                      <button
                        type="button"
                        className="resume-open"
                        onClick={() => onOpen(r.id)}
                      >
                        {r.title}
                      </button>
                      <p className="resume-project">
                        {r.projectName} · {r.priority}
                      </p>
                      <select
                        className="move-select"
                        aria-label={`Mover ${r.title} para`}
                        value=""
                        ref={(el) => {
                          if (el && pendingFocus.current === r.id) {
                            pendingFocus.current = null;
                            el.focus();
                          }
                        }}
                        onChange={(e) => {
                          // o valor vem do navegador: só os três estados valem
                          const next = STATES.find((s) => s === e.target.value);
                          if (!next) return;
                          pendingFocus.current = r.id;
                          onMove(r.id, next);
                          setMessage(`${r.title} movida para ${next}.`);
                        }}
                      >
                        <option value="">Mover para…</option>
                        {STATES.filter((s) => s !== state).map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              )}
              {items.length > 5 && (
                <p className="focus-note">
                  Mostrando as 5 primeiras de {items.length}. Volte ao modo
                  Completo para ver todas.
                </p>
              )}
            </section>
          );
        })}
      </div>
      <p role="status" className="board-message">
        {message}
      </p>
    </>
  );
}
