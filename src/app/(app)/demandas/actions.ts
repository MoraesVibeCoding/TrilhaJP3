"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { validateTitle } from "@/lib/capture";
import { priorityValue } from "@/lib/demand-labels";
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
