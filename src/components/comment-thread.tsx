"use client";

import {
  Fragment,
  startTransition,
  useEffect,
  useId,
  useOptimistic,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { addComment, archiveComment } from "@/app/(app)/demandas/actions";
import { formatCommentTime, linkParts } from "@/lib/comments";
import type { Demand } from "@/lib/demand-labels";
import { useFlashMessage } from "@/lib/use-flash-message";
import { Icon } from "./icon";

type Comment = Demand["comments"][number];
type Change = { add: Comment } | { remove: string };

const FAILED = "Não foi possível salvar. Tente de novo.";

// T9, proposta B: o campo fica antes da lista, que vai do mais antigo ao mais novo.
// Cada comentário seu tem uma lixeira, com a confirmação na própria linha.
export function CommentThread({
  taskId,
  comments,
  now,
  heading,
}: {
  taskId: string;
  comments: readonly Comment[];
  now: Date;
  // O título fica com quem usa (resumo da janela ou h2 da página); a contagem vem daqui.
  heading: (count: number) => ReactNode;
}) {
  const [list, change] = useOptimistic(comments, (l, c: Change) =>
    "add" in c ? [...l, c.add] : l.filter((x) => x.id !== c.remove),
  );
  const [message, setMessage] = useFlashMessage();
  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const hintId = useId();
  // Foco depois de fechar a confirmação: decidido no evento, aplicado depois da renderização.
  const focusTrash = useRef<string | null>(null);
  useEffect(() => {
    if (confirming || !focusTrash.current) return;
    listRef.current
      ?.querySelector<HTMLButtonElement>(
        `[data-comment="${focusTrash.current}"] .comment-delete`,
      )
      ?.focus();
    focusTrash.current = null;
  }, [confirming]);

  function publish() {
    const body = draft.trim();
    fieldRef.current?.focus();
    if (!body) {
      setMessage("Escreva o comentário antes de publicar.");
      return;
    }
    setDraft("");
    startTransition(async () => {
      change({
        add: {
          author: "Você",
          at: new Date().toISOString(),
          text: body,
          mine: true,
        },
      });
      if (await addComment(taskId, body)) return;
      // Não apaga o que já foi digitado depois.
      setDraft((d) => d || body);
      setMessage(FAILED);
    });
  }

  function archive(id: string) {
    setConfirming(null);
    fieldRef.current?.focus();
    startTransition(async () => {
      change({ remove: id });
      if (!(await archiveComment(id))) setMessage(FAILED);
    });
  }

  function cancel(id: string) {
    focusTrash.current = id;
    setConfirming(null);
  }

  return (
    <>
      {heading(list.length)}
      <div className="comments">
        <form
          className="comment-form"
          onSubmit={(e) => {
            e.preventDefault();
            publish();
          }}
        >
          <textarea
            ref={fieldRef}
            className="comment-field"
            aria-label="Novo comentário"
            aria-describedby={hintId}
            placeholder="Escreva um comentário"
            maxLength={5000}
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !(e.ctrlKey || e.metaKey)) return;
              e.preventDefault();
              publish();
            }}
          />
          <div className="comment-form-row">
            <button type="submit" className="primary-button">
              Comentar
            </button>
            <span id={hintId} className="comment-hint">
              Ctrl+Enter ou ⌘+Enter publica
            </span>
          </div>
        </form>
        <p role="alert" className="step-error">
          {message}
        </p>
        {list.length === 0 ? (
          <p className="comment-empty">Nenhum comentário.</p>
        ) : (
          <ol className="comment-list" ref={listRef}>
            {list.map((c, i) => {
              const time = formatCommentTime(c.at, now);
              return (
                <li key={c.id ?? `novo-${i}`} data-comment={c.id}>
                  <p className="comment-meta">
                    <span className="comment-author">
                      {c.mine ? "Você" : c.author}
                    </span>
                    {/* A hora sai do fuso de quem vê: no servidor pode ser outro */}
                    <time dateTime={c.at} suppressHydrationWarning>
                      {time}
                    </time>
                    {c.mine && c.id && (
                      <button
                        type="button"
                        className="step-button comment-delete"
                        aria-label={`Apagar comentário de ${time}`}
                        onClick={() => setConfirming(c.id!)}
                      >
                        <Icon name="excluir" size={18} />
                      </button>
                    )}
                  </p>
                  <p className="comment-body">
                    {linkParts(c.text).map((p, j) =>
                      "href" in p ? (
                        <a
                          key={j}
                          href={p.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {p.href}
                        </a>
                      ) : (
                        <Fragment key={j}>{p.text}</Fragment>
                      ),
                    )}
                  </p>
                  {confirming === c.id && (
                    <div
                      className="comment-confirm"
                      onKeyDown={(e) => {
                        if (e.key !== "Escape") return;
                        // Esc fecha só a confirmação, não a janela da demanda.
                        e.preventDefault();
                        e.stopPropagation();
                        cancel(c.id!);
                      }}
                    >
                      Apagar este comentário?
                      <button
                        type="button"
                        className="primary-button"
                        autoFocus
                        onClick={() => archive(c.id!)}
                      >
                        Apagar
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => cancel(c.id!)}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </>
  );
}
