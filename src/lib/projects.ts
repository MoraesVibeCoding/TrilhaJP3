// Leitura dos projetos da empresa do usuário (a RLS da T4 só devolve os dela).
import { getCurrentUser } from "@/lib/auth";
import type {
  ProjectPriorityValue,
  ProjectStatusValue,
} from "@/lib/project-input";
import { createClient } from "@/lib/supabase/server";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatusValue;
  priority: ProjectPriorityValue;
  link: string | null;
  archived_at: string | null;
};

export async function listProjects(): Promise<Project[]> {
  await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, status, priority, link, archived_at")
    .order("name");
  if (error) throw error;
  return data as Project[];
}
