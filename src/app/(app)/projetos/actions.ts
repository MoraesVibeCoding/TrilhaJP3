"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { parseProject, type ProjectField } from "@/lib/project-input";
import { createClient } from "@/lib/supabase/server";

export type ProjectFormState =
  | { saved: true }
  | {
      errors: Partial<Record<ProjectField | "form", string>>;
      // O React limpa o formulário depois da ação: os valores voltam para os campos.
      values?: Record<string, string>;
    }
  | undefined;

const FAILED = "Não foi possível salvar. Tente de novo.";
const NOT_FOUND = "Projeto não encontrado.";
const PATH = "/projetos";
const id = z.uuid();

function typed(form: FormData) {
  const values: Record<string, string> = {};
  for (const field of ["name", "description", "status", "priority", "link"])
    values[field] = String(form.get(field) ?? "");
  return values;
}

export async function createProject(
  _previous: ProjectFormState,
  form: FormData,
): Promise<ProjectFormState> {
  // A empresa vem da sessão verificada, nunca do formulário.
  const user = await getCurrentUser();
  const input = parseProject(form);
  if (!input.ok) return { errors: input.errors, values: typed(form) };
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .insert({ organization_id: user.organizationId, ...input.data });
  if (error) return { errors: { form: FAILED }, values: typed(form) };
  revalidatePath(PATH);
  return { saved: true };
}

export async function updateProject(
  _previous: ProjectFormState,
  form: FormData,
): Promise<ProjectFormState> {
  await getCurrentUser();
  const projectId = id.safeParse(form.get("id"));
  if (!projectId.success) return { errors: { form: NOT_FOUND } };
  const input = parseProject(form);
  if (!input.ok) return { errors: input.errors, values: typed(form) };
  const supabase = await createClient();
  // A RLS só deixa alterar projetos da própria empresa; nenhuma linha = não encontrado.
  const { data, error } = await supabase
    .from("projects")
    .update(input.data)
    .eq("id", projectId.data)
    .select("id");
  if (error) return { errors: { form: FAILED }, values: typed(form) };
  if (!data?.length) return { errors: { form: NOT_FOUND } };
  revalidatePath(PATH);
  return { saved: true };
}

// Responde se arquivou (ou restaurou) de fato: a tela não anuncia sucesso que não houve.
export async function setArchived(form: FormData): Promise<boolean> {
  await getCurrentUser();
  const projectId = id.safeParse(form.get("id"));
  if (!projectId.success) return false;
  const archived = form.get("archived") === "true";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", projectId.data)
    .select("id");
  if (error || !data?.length) return false;
  revalidatePath(PATH);
  return true;
}
