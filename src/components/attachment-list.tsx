"use client";

import Image from "next/image";
import {
  startTransition,
  useEffect,
  useId,
  useOptimistic,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addAttachment,
  attachmentUrl,
  prepareAttachment,
  removeAttachment,
  thumbnailUrls,
} from "@/app/(app)/demandas/actions";
import { ACCEPTED, checkFile, formatSize, isImage } from "@/lib/attachments";
import { formatCommentTime } from "@/lib/comments";
import type { Demand } from "@/lib/demand-labels";
import { createClient } from "@/lib/supabase/browser";
import { useFlashMessage } from "@/lib/use-flash-message";
import { Icon } from "./icon";

type Attachment = Demand["attachments"][number];

const FAILED = "Não foi possível salvar. Tente de novo.";
const kindOf = (name: string) =>
  /\.([a-z0-9]+)$/i.exec(name)?.[1].toUpperCase() ?? "";

// T11, proposta A: botão no topo com a regra ao lado; cada anexo numa linha com miniatura (ou o tipo),
// o nome como link, tamanho, autor e data em mono, e "Remover" nos seus, com a confirmação na linha.
export function AttachmentList({
  taskId,
  attachments,
  now,
  heading,
}: {
  taskId: string;
  attachments: readonly Attachment[];
  now: Date;
  // O título fica com quem usa (resumo da janela ou h2 da página); a contagem vem daqui.
  heading: (count: number) => ReactNode;
}) {
  const [list, remove] = useOptimistic(attachments, (l, id: string) =>
    l.filter((a) => a.id !== id),
  );
  const [message, setMessage] = useFlashMessage(6000);
  const [sending, setSending] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const pickRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const inputId = useId();
  const hintId = useId();

  // As miniaturas usam links assinados, pedidos de uma vez quando as imagens mudam.
  const imageKey = attachments
    .filter((a) => a.id && isImage(a.mime ?? ""))
    .map((a) => a.id)
    .join(",");
  useEffect(() => {
    if (!imageKey) return;
    let live = true;
    thumbnailUrls(taskId).then((urls) => {
      if (live) setThumbs(urls);
    });
    return () => {
      live = false;
    };
  }, [taskId, imageKey]);

  // Foco depois de fechar a confirmação: decidido no evento, aplicado depois da renderização.
  const focusRemove = useRef<string | null>(null);
  useEffect(() => {
    if (confirming || !focusRemove.current) return;
    listRef.current
      ?.querySelector<HTMLButtonElement>(
        `[data-attachment="${focusRemove.current}"] .attachment-remove`,
      )
      ?.focus();
    focusRemove.current = null;
  }, [confirming]);

  async function send(files: File[]) {
    const problems: string[] = [];
    const ok = files.filter((file) => {
      const problem = checkFile(file);
      if (problem) problems.push(problem);
      return !problem;
    });
    setMessage(problems.join(" "));
    for (const file of ok) {
      setSending(`Enviando ${file.name}…`);
      const ready = await prepareAttachment(taskId, file.name, file.size);
      const stored =
        ready &&
        !(
          await createClient()
            .storage.from("attachments")
            .upload(ready.path, file, { contentType: ready.contentType })
        ).error;
      const saved =
        stored && (await addAttachment(taskId, ready.path, file.name));
      if (!saved) {
        problems.push(`Não foi possível enviar ${file.name}. Tente de novo.`);
        setMessage(problems.join(" "));
      }
    }
    setSending("");
  }

  async function open(file: Attachment) {
    // A aba abre no clique (fora dele, o navegador bloqueia) e recebe o link quando ele chega.
    const tab = window.open("", "_blank");
    const url = await attachmentUrl(file.id!);
    if (url && tab) {
      tab.opener = null;
      tab.location.href = url;
      return;
    }
    tab?.close();
    setMessage(`Não foi possível abrir ${file.name}. Tente de novo.`);
  }

  function archive(id: string) {
    setConfirming(null);
    pickRef.current?.focus();
    startTransition(async () => {
      remove(id);
      if (!(await removeAttachment(id))) setMessage(FAILED);
    });
  }

  function cancel(id: string) {
    focusRemove.current = id;
    setConfirming(null);
  }

  return (
    <>
      {heading(list.length)}
      <div className="attachments">
        <div className="attachment-pick">
          <button
            type="button"
            ref={pickRef}
            className="secondary-button attachment-button"
            aria-describedby={hintId}
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="anexo" size={18} />
            Anexar arquivos
          </button>
          <span id={hintId} className="attachment-hint">
            Imagens, PDF e documentos, até 10&nbsp;MB
          </span>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            multiple
            hidden
            accept={ACCEPTED}
            aria-label="Escolher arquivos"
            onChange={(e) => {
              const files = [...(e.target.files ?? [])];
              e.target.value = "";
              if (files.length) void send(files);
            }}
          />
        </div>
        {/* aria-live sem role="status": a página já tem o status dela (board-message) */}
        <p aria-live="polite" className="attachment-sending">
          {sending}
          {sending && (
            // Indeterminada: o envio pelo supabase-js não informa quanto já foi.
            <span
              className="attachment-progress"
              role="progressbar"
              aria-label={sending}
            />
          )}
        </p>
        <p role="alert" className="step-error">
          {message}
        </p>
        {list.length === 0 ? (
          <p className="attachment-empty">Nenhum anexo.</p>
        ) : (
          <ol className="attachment-list" ref={listRef}>
            {list.map((file, i) => {
              const thumb = file.id ? thumbs[file.id] : undefined;
              return (
                <li
                  key={file.id ?? `novo-${i}`}
                  data-attachment={file.id}
                  // Na linha toda, não só na confirmação: o foco pode ainda estar em Remover.
                  onKeyDown={(e) => {
                    if (e.key !== "Escape" || confirming !== file.id) return;
                    // Esc fecha só a confirmação, não a janela da demanda.
                    e.preventDefault();
                    e.stopPropagation();
                    cancel(file.id!);
                  }}
                >
                  <span className="attachment-thumb">
                    {thumb ? (
                      // Link assinado e temporário do Storage: sem otimização do Next, que guardaria o link.
                      <Image
                        src={thumb}
                        alt={file.name}
                        width={48}
                        height={48}
                        unoptimized
                      />
                    ) : (
                      kindOf(file.name)
                    )}
                  </span>
                  <span className="attachment-body">
                    <button
                      type="button"
                      className="attachment-name"
                      onClick={() => void open(file)}
                    >
                      {file.name}
                    </button>
                    <span className="attachment-meta">
                      {formatSize(file.size ?? 0)} ·{" "}
                      {file.mine ? "Você" : file.author} ·{" "}
                      <time dateTime={file.at} suppressHydrationWarning>
                        {file.at ? formatCommentTime(file.at, now) : ""}
                      </time>
                    </span>
                  </span>
                  {file.mine && file.id && (
                    <button
                      type="button"
                      className="attachment-remove"
                      aria-label={`Remover ${file.name}`}
                      onClick={() => setConfirming(file.id!)}
                    >
                      Remover
                    </button>
                  )}
                  {confirming === file.id && (
                    <div
                      className="attachment-confirm"
                      role="group"
                      aria-label="Remover este anexo?"
                    >
                      <span className="attachment-confirm-text">
                        Remover este anexo?
                      </span>
                      <button
                        type="button"
                        className="primary-button"
                        autoFocus
                        onClick={() => archive(file.id!)}
                      >
                        Remover
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => cancel(file.id!)}
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
