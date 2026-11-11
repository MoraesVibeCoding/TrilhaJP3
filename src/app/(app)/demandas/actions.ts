"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  checkFile,
  contentTypeOf,
  opensInBrowser,
  safeName,
} from "@/lib/attachments";
import { getCurrentUser } from "@/lib/auth";
import { MAX_CAPTURED, validateTitle } from "@/lib/capture";
import { parseDemand, type DemandField } from "@/lib/demand-input";
import { priorityValue } from "@/lib/demand-labels";
import {
  LABEL_COLORS,
  sameName,
  validateLabelName,
  type Label,
} from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";

const id = z.uuid();
const state = z.enum(["todo", "doing", "done"]);

// A RLS só deixa alterar demandas da própria empresa; nenhuma linha devolvida = não alterou.
async function update(taskId: string, change: object) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(change)
    .eq("id", taskId)
    .select("id");
  return !error && !!data?.length;
}

// Retomar, Demandas e a página da demanda leem as mesmas linhas.
function done(ok: boolean) {
  if (ok) revalidatePath("/", "layout");
  return ok;
}

// Cada ação responde se gravou: a tela desfaz a mudança otimista quando não.
export async function moveDemand(taskId: string, to: string) {
  await getCurrentUser();
  const input = z.tuple([id, state]).safeParse([taskId, to]);
  if (!input.success) return false;
  return done(await update(input.data[0], { state: input.data[1] }));
}

// "Concluir passo": a primeira subtarefa aberta, na ordem de criação.
export async function concludeStep(taskId: string) {
  await getCurrentUser();
  const parent = id.safeParse(taskId);
  if (!parent.success) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id")
    .eq("parent_task_id", parent.data)
    .neq("state", "done")
    .is("archived_at", null)
    .order("created_at")
    .limit(1);
  if (error || !data?.length) return false;
  return done(await update(data[0].id, { state: "done" }));
}

// Uma "Agora" por empresa (índice único): tira a anterior antes de marcar a nova.
export async function setNow(taskId: string, now: boolean) {
  const user = await getCurrentUser();
  const target = id.safeParse(taskId);
  if (!target.success) return false;
  if (now) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("tasks")
      .update({ is_now: false })
      .eq("organization_id", user.organizationId)
      .eq("is_now", true)
      .neq("id", target.data);
    if (error) return false;
  }
  return done(await update(target.data, { is_now: now }));
}

const NOT_CREATED = "Não foi possível criar. Tente de novo.";

// Captura rápida: a empresa vem da sessão; o projeto precisa ser dela (chave composta e RLS).
export async function createDemand(input: {
  title: string;
  projectId: string;
  priority: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  const title = validateTitle(String(input.title));
  if (!title.ok) return title;
  const projectId = id.safeParse(input.projectId);
  const priority = priorityValue(String(input.priority));
  if (!projectId.success || !priority) return { ok: false, error: NOT_CREATED };
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    organization_id: user.organizationId,
    project_id: projectId.data,
    title: title.title,
    priority,
    state: "todo",
  });
  if (error) return { ok: false, error: NOT_CREATED };
  revalidatePath("/", "layout");
  return { ok: true };
}

// A janela de captura vive na casca (estática): busca projetos e títulos ao abrir.
export async function captureOptions() {
  await getCurrentUser();
  const supabase = await createClient();
  const [projects, demands] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name")
      .is("archived_at", null)
      .order("name"),
    supabase
      .from("tasks")
      .select("id, title")
      .is("archived_at", null)
      .is("parent_task_id", null),
  ]);
  if (projects.error || demands.error) return null;
  return {
    projects: projects.data as { id: string; name: string }[],
    demands: demands.data as { id: string; title: string }[],
  };
}

export type DemandFormState =
  | { saved: true }
  | {
      errors: Partial<Record<DemandField | "form", string>>;
      // O React limpa o formulário depois da ação: os valores voltam para os campos.
      values?: Record<string, string>;
    }
  | undefined;

function typed(form: FormData) {
  const values: Record<string, string> = {};
  for (const field of ["title", "description", "priority", "due_date"])
    values[field] = String(form.get(field) ?? "");
  return values;
}

// Página inteira: título, descrição, prioridade e prazo. Empresa e projeto não mudam (grants da tabela).
export async function updateDemand(
  _previous: DemandFormState,
  form: FormData,
): Promise<DemandFormState> {
  await getCurrentUser();
  const taskId = id.safeParse(form.get("id"));
  if (!taskId.success) return { errors: { form: "Demanda não encontrada." } };
  const input = parseDemand(form);
  if (!input.ok) return { errors: input.errors, values: typed(form) };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(input.data)
    .eq("id", taskId.data)
    .select("id");
  if (error)
    return {
      errors: { form: "Não foi possível salvar. Tente de novo." },
      values: typed(form),
    };
  if (!data?.length) return { errors: { form: "Demanda não encontrada." } };
  revalidatePath("/", "layout");
  return { saved: true };
}

const NOT_IMPORTED = "Não foi possível importar. Tente de novo.";

// Decisão 3 da T5: as demandas capturadas só no navegador entram no banco, num projeto escolhido.
export async function importDemands(input: {
  projectId: string;
  items: { title: string; priority: string }[];
}): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  const projectId = id.safeParse(input.projectId);
  const items = Array.isArray(input.items) ? input.items : [];
  if (!projectId.success || items.length === 0 || items.length > MAX_CAPTURED)
    return { ok: false, error: NOT_IMPORTED };
  const rows = [];
  for (const item of items) {
    const title = validateTitle(String(item?.title));
    const priority = priorityValue(String(item?.priority));
    if (!title.ok || !priority) return { ok: false, error: NOT_IMPORTED };
    rows.push({
      organization_id: user.organizationId,
      project_id: projectId.data,
      title: title.title,
      priority,
      state: "todo",
    });
  }
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert(rows);
  if (error) return { ok: false, error: NOT_IMPORTED };
  revalidatePath("/", "layout");
  return { ok: true, count: rows.length };
}

// Subtarefas (T7). A regra de um nível mora no banco; aqui só a entrada é validada.
export async function addSubtask(parentId: string, rawTitle: string) {
  const user = await getCurrentUser();
  const parent = id.safeParse(parentId);
  const title = validateTitle(String(rawTitle));
  if (!parent.success || !title.ok) return false;
  const supabase = await createClient();
  // A filha herda o projeto da mãe; a mãe precisa ser uma demanda ativa de primeiro nível.
  const mother = await supabase
    .from("tasks")
    .select("project_id")
    .eq("id", parent.data)
    .is("parent_task_id", null)
    .is("archived_at", null)
    .single();
  if (mother.error || !mother.data) return false;
  const { error } = await supabase.from("tasks").insert({
    organization_id: user.organizationId,
    project_id: mother.data.project_id,
    parent_task_id: parent.data,
    title: title.title,
    state: "todo",
  });
  return done(!error);
}

// Só linhas com mãe: estas ações nunca alteram uma demanda de primeiro nível.
async function updateSubtask(taskId: string, change: object) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(change)
    .eq("id", taskId)
    .not("parent_task_id", "is", null)
    .select("id");
  return done(!error && !!data?.length);
}

export async function renameSubtask(taskId: string, rawTitle: string) {
  await getCurrentUser();
  const target = id.safeParse(taskId);
  const title = validateTitle(String(rawTitle));
  if (!target.success || !title.ok) return false;
  return updateSubtask(target.data, { title: title.title });
}

export async function toggleSubtask(taskId: string, isDone: boolean) {
  await getCurrentUser();
  const input = z.tuple([id, z.boolean()]).safeParse([taskId, isDone]);
  if (!input.success) return false;
  return updateSubtask(input.data[0], {
    state: input.data[1] ? "done" : "todo",
  });
}

// Remover é arquivar, como as demandas: some da lista e da contagem de passos.
export async function archiveSubtask(taskId: string) {
  await getCurrentUser();
  const target = id.safeParse(taskId);
  if (!target.success) return false;
  return updateSubtask(target.data, { archived_at: new Date().toISOString() });
}

// Etiquetas (T8). Aplicar cria a etiqueta quando o nome é novo; o banco garante empresa, nome único e paleta.
export async function applyLabel(
  taskId: string,
  rawName: string,
): Promise<Label | null> {
  const user = await getCurrentUser();
  const task = id.safeParse(taskId);
  const name = validateLabelName(String(rawName));
  if (!task.success || !name.ok) return null;
  const supabase = await createClient();
  const existing = await supabase.from("labels").select("id, name, color");
  if (existing.error) return null;
  let label = (existing.data as Label[]).find((l) =>
    sameName(l.name, name.name),
  );
  if (!label) {
    const created = await supabase
      .from("labels")
      .insert({ organization_id: user.organizationId, name: name.name })
      .select("id, name, color")
      .single();
    if (created.error || !created.data) return null;
    label = created.data as Label;
  }
  const { error } = await supabase.from("task_labels").insert({
    organization_id: user.organizationId,
    task_id: task.data,
    label_id: label.id,
  });
  // Já aplicada (chave primária repetida) é o resultado que se queria.
  if (error && error.code !== "23505") return null;
  done(true);
  return label;
}

export async function removeLabel(taskId: string, labelId: string) {
  await getCurrentUser();
  const input = z.tuple([id, id]).safeParse([taskId, labelId]);
  if (!input.success) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_labels")
    .delete()
    .eq("task_id", input.data[0])
    .eq("label_id", input.data[1])
    .select("label_id");
  return done(!error && !!data?.length);
}

const labelColor = z.enum(LABEL_COLORS.map((c) => c.value));

export async function setLabelColor(labelId: string, color: string) {
  await getCurrentUser();
  const input = z.tuple([id, labelColor]).safeParse([labelId, color]);
  if (!input.success) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("labels")
    .update({ color: input.data[1] })
    .eq("id", input.data[0])
    .select("id");
  return done(!error && !!data?.length);
}

// Comentários (T9). O texto é guardado como veio (sem as pontas); quem escreveu fica com o banco.
const commentBody = z.string().trim().min(1).max(5000);

export async function addComment(taskId: string, body: string) {
  const user = await getCurrentUser();
  const input = z.tuple([id, commentBody]).safeParse([taskId, body]);
  if (!input.success) return false;
  const supabase = await createClient();
  const { error } = await supabase.from("task_comments").insert({
    organization_id: user.organizationId,
    task_id: input.data[0],
    body: input.data[1],
  });
  return done(!error);
}

// Arquivar é o "apagar" do autor; a RLS só deixa o próprio, então nenhuma linha = não era dele.
export async function archiveComment(commentId: string) {
  await getCurrentUser();
  const target = id.safeParse(commentId);
  if (!target.success) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_comments")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", target.data)
    .select("id");
  return done(!error && !!data?.length);
}

// T11: anexos. O arquivo vai do navegador direto para o Storage (a Server Action aceita só 1 MB);
// aqui ficam o caminho, o registro, a remoção e os links assinados. O banco confere tudo de novo.
const BUCKET = "attachments";
// Links assinados valem 5 minutos.
const LINK_SECONDS = 300;

export async function prepareAttachment(
  taskId: string,
  fileName: string,
  size: number,
) {
  const user = await getCurrentUser();
  if (!id.safeParse(taskId).success) return null;
  if (checkFile({ name: fileName, size })) return null;
  return {
    path: `${user.organizationId}/${taskId}/${crypto.randomUUID()}-${safeName(fileName)}`,
    contentType: contentTypeOf(fileName)!,
  };
}

const attachmentName = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .refine((name) => !!contentTypeOf(name));

export async function addAttachment(
  taskId: string,
  storagePath: string,
  fileName: string,
) {
  const user = await getCurrentUser();
  const input = z
    .tuple([id, z.string(), attachmentName])
    .safeParse([taskId, storagePath, fileName]);
  if (!input.success) return false;
  const [task, path, name] = input.data;
  if (!path.startsWith(`${user.organizationId}/${task}/`)) return false;
  const supabase = await createClient();
  const { error } = await supabase.from("attachments").insert({
    organization_id: user.organizationId,
    task_id: task,
    storage_path: path,
    file_name: name,
  });
  return done(!error);
}

// A RLS só deixa quem enviou apagar a linha; só então o arquivo sai (a política do Storage pede o dono).
export async function removeAttachment(attachmentId: string) {
  await getCurrentUser();
  const target = id.safeParse(attachmentId);
  if (!target.success) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", target.data)
    .select("storage_path");
  if (error || !data?.length) return false;
  // Se o arquivo não sair, sobra um órfão no Storage, sem registro e sem link (tasks/t11-spec.md, risco 2).
  await supabase.storage.from(BUCKET).remove([data[0].storage_path]);
  return done(true);
}

export async function attachmentUrl(attachmentId: string) {
  await getCurrentUser();
  const target = id.safeParse(attachmentId);
  if (!target.success) return null;
  const supabase = await createClient();
  const { data: file, error } = await supabase
    .from("attachments")
    .select("storage_path, mime_type, file_name")
    .eq("id", target.data)
    .single();
  if (error || !file) return null;
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(
      file.storage_path,
      LINK_SECONDS,
      opensInBrowser(file.mime_type) ? {} : { download: file.file_name },
    );
  return data?.signedUrl ?? null;
}

// As miniaturas das imagens de uma demanda, num pedido só: id do anexo → link.
export async function thumbnailUrls(
  taskId: string,
): Promise<Record<string, string>> {
  await getCurrentUser();
  const task = id.safeParse(taskId);
  if (!task.success) return {};
  const supabase = await createClient();
  const { data: images } = await supabase
    .from("attachments")
    .select("id, storage_path")
    .eq("task_id", task.data)
    .like("mime_type", "image/%");
  if (!images?.length) return {};
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(
    images.map((i) => i.storage_path),
    LINK_SECONDS,
  );
  const byPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return Object.fromEntries(
    images
      .filter((i) => byPath.get(i.storage_path))
      .map((i) => [i.id, byPath.get(i.storage_path)!]),
  );
}
