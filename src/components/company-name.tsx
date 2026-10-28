import { connection } from "next/server";
import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";

// O topo mostra o nome em dois lugares (barra do celular e barra lateral): uma leitura por requisição.
const companyName = cache(
  async () => (await getCurrentUser()).organizationName,
);

// Componente de servidor: entra na casca (cliente) dentro de <Suspense>, porque lê a sessão.
export async function CompanyName() {
  // O cliente do Supabase lê o relógio, que não pode entrar na pré-renderização.
  await connection();
  return companyName();
}
