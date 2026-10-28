"use client";

// T5.3, proposta C: as demandas capturadas só no navegador antes da T5 entram no banco, marcadas uma a uma.
import Link from "next/link";
import { useId, useState } from "react";
import { importDemands } from "@/app/(app)/demandas/actions";
import { useCapturedDemands, CAPTURED_STORAGE } from "@/lib/use-captured";
import { useFlashMessage } from "@/lib/use-flash-message";

export function ImportCaptured({
  projects,
  storageKey = CAPTURED_STORAGE,
}: {
  projects: readonly { id: string; name: string }[];
  storageKey?: string;
}) {
  const [captured, setCaptured] = useCapturedDemands(storageKey);
  const [unmarked, setUnmarked] = useState<ReadonlySet<string>>(new Set());
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useFlashMessage();
  const titleId = useId();

  // Nada capturado e nada a anunciar: nada na tela (a página já tem a própria região de aviso).
  if (captured.length === 0 && !message) return null;

  const marked = captured.filter((d) => !unmarked.has(d.id));
  const n = captured.length;

  function toggle(id: string) {
    const next = new Set(unmarked);
    if (!next.delete(id)) next.add(id);
    setUnmarked(next);
  }

  async function bring() {
    setPending(true);
    setError("");
    const result = await importDemands({
      projectId,
      items: marked.map((d) => ({ title: d.title, priority: d.priority })),
    });
    setPending(false);
    if (!result.ok) return setError(result.error);
    // só sai do navegador o que o banco confirmou
    setCaptured(captured.filter((d) => unmarked.has(d.id)));
    const name = projects.find((p) => p.id === projectId)?.name;
    setMessage(
      `${marked.length} ${marked.length === 1 ? "demanda importada" : "demandas importadas"} para ${name}.`,
    );
  }

  // O aviso fica na mesma posição com ou sem a seção: o leitor de tela anuncia o fim da importação.
  return (
    <>
      {captured.length > 0 && (
        <section className="import-note" aria-labelledby={titleId}>
          <p id={titleId}>
            <b>
              {n} {n === 1 ? "demanda capturada" : "demandas capturadas"} só
              neste navegador.
            </b>{" "}
            Elas foram criadas antes de o Trilha JP3 gravar no banco. Marque as
            que quer trazer e escolha o projeto.
          </p>
          <fieldset className="import-list">
            <legend className="visually-hidden">Demandas para importar</legend>
            {captured.map((d) => (
              <label key={d.id} className="import-item">
                <input
                  type="checkbox"
                  checked={!unmarked.has(d.id)}
                  onChange={() => toggle(d.id)}
                />
                {d.title}
              </label>
            ))}
          </fieldset>
          {error && (
            <p className="project-form-error" role="alert">
              {error}
            </p>
          )}
          {projects.length === 0 ? (
            <p>
              Toda demanda fica num projeto.{" "}
              <Link href="/projetos">Crie o primeiro em Projetos</Link>.
            </p>
          ) : (
            <div className="import-actions">
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
              <button
                type="button"
                className="primary-button"
                disabled={pending || marked.length === 0}
                onClick={bring}
              >
                {pending
                  ? "Importando…"
                  : `Importar ${marked.length} ${marked.length === 1 ? "demanda" : "demandas"}`}
              </button>
              {unmarked.size > 0 && (
                <button
                  type="button"
                  className="secondary-button"
                  disabled={pending}
                  onClick={() => {
                    setCaptured(marked);
                    setUnmarked(new Set());
                  }}
                >
                  Descartar as desmarcadas
                </button>
              )}
            </div>
          )}
        </section>
      )}
      <p role="status" className="board-message">
        {message}
      </p>
    </>
  );
}
