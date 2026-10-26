#!/usr/bin/env node
// Aplica supabase/migrations/ pela Management API (o ambiente de nuvem não alcança o Postgres direto).
// Registra cada versão na mesma tabela de histórico da CLI do Supabase, para `supabase db push` continuar servindo.
// Uso: node scripts/db-migrate.mjs                      aplica as pendentes
//      node scripts/db-migrate.mjs --rollback <versão>  roda supabase/rollbacks/<versão>_*.sql e tira a versão do histórico
// Precisa de NEXT_PUBLIC_SUPABASE_URL e SUPABASE_ACCESS_TOKEN. Saída: 0 ok, 1 falhou.
import { readdirSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const MIGRATIONS = "supabase/migrations";
const ROLLBACKS = "supabase/rollbacks";

// Igual à CLI 2.122.0 (conferido no binário): a tabela nasce só com version; name e statements vêm depois.
const HISTORY = `
create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations (version text not null primary key);
alter table supabase_migrations.schema_migrations add column if not exists statements text[];
alter table supabase_migrations.schema_migrations add column if not exists name text;`;

export function versionOf(file) {
  const match = /^(\d{14})_(.+)\.sql$/.exec(file);
  if (!match) throw new Error(`nome inválido de migração: ${file}`);
  return { version: match[1], name: match[2] };
}

export function pending(files, applied) {
  const done = new Set(applied);
  return files
    .filter((f) => !done.has(versionOf(f).version))
    .sort((x, y) => versionOf(x).version.localeCompare(versionOf(y).version));
}

export function sqlString(text) {
  return `'${text.replaceAll("'", "''")}'`;
}

export function projectRef(url) {
  const match = /^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/.exec(url ?? "");
  if (!match)
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não é uma URL do Supabase");
  return match[1];
}

async function query(sql) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("falta SUPABASE_ACCESS_TOKEN");
  const ref = projectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`);
  return body;
}

// Uma transação por arquivo: se o SQL falhar, nem o esquema nem o histórico mudam (conferido na Management API em 2026-10-26).
// shortcut: o arquivo não pode ter begin/commit próprios, senão a atomicidade quebra; trocar pela CLI quando houver conexão direta.
async function migrate() {
  await query(HISTORY);
  const rows = await query(
    "select version from supabase_migrations.schema_migrations",
  );
  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql"));
  const todo = pending(
    files,
    rows.map((r) => r.version),
  );
  if (todo.length === 0) return console.log("db-migrate: nada pendente");
  for (const file of todo) {
    const { version, name } = versionOf(file);
    const sql = readFileSync(`${MIGRATIONS}/${file}`, "utf8");
    await query(`begin;
${sql}
;
insert into supabase_migrations.schema_migrations (version, name, statements)
values (${sqlString(version)}, ${sqlString(name)}, array[${sqlString(sql)}]);
commit;`);
    console.log(`db-migrate: aplicada ${file}`);
  }
}

async function rollback(version) {
  const file = readdirSync(ROLLBACKS).find(
    (f) => f.endsWith(".sql") && versionOf(f).version === version,
  );
  if (!file) throw new Error(`sem reversão para a versão ${version}`);
  const sql = readFileSync(`${ROLLBACKS}/${file}`, "utf8");
  await query(`begin;
${sql}
;
delete from supabase_migrations.schema_migrations where version = ${sqlString(version)};
commit;`);
  console.log(`db-migrate: revertida ${file}`);
}

async function main() {
  const [flag, version] = process.argv.slice(2);
  try {
    if (flag === "--rollback") await rollback(version);
    else await migrate();
  } catch (e) {
    console.error("db-migrate: " + e.message);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main();
