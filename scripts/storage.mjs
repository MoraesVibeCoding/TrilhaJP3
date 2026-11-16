#!/usr/bin/env node
// T13: órfãos e backup dos anexos do Storage (tasks/t13-spec.md, seção 2, itens 3 e 4; docs/OPERACAO-BACKUP.md).
// Uso: npm run storage:orphans                 lista os arquivos sem registro há mais de 24 horas
//      npm run storage:orphans -- --apply      lista, pede que digite "apagar" e só então remove
//      npm run storage:backup -- <pasta>       baixa todos os anexos para uma pasta fora do repositório
//      npm run storage:restore -- <pasta>      envia os anexos de um backup para o projeto das variáveis
// Roda no computador do Pedro. Precisa de NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY só na sessão
// do terminal, nunca em arquivo versionado. Saída: 0 ok, 1 falhou.
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "attachments";
const PAGE = 1000;
const DAY = 24 * 60 * 60 * 1000;
export const CONFIRM = "apagar";
const MANIFEST = "manifest.json";

/** @typedef {{ path: string, size: number, type: string, createdAt: string }} StoredObject */

// Todos os objetos sob o prefixo ("" = o bucket inteiro), descendo pelas pastas {empresa}/{demanda}/.
/** @returns {Promise<StoredObject[]>} */
export async function listObjects(client, prefix = "") {
  const folder = prefix.replace(/\/$/, "");
  const found = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await client.storage.from(BUCKET).list(folder, {
      limit: PAGE,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    for (const entry of data) {
      const path = folder ? `${folder}/${entry.name}` : entry.name;
      // Pasta não tem id: desce nela.
      if (entry.id === null) found.push(...(await listObjects(client, path)));
      else
        found.push({
          path,
          size: entry.metadata?.size ?? 0,
          type: entry.metadata?.mimetype ?? "",
          createdAt: entry.created_at,
        });
    }
    if (data.length < PAGE) return found;
  }
}

async function registeredPaths(client) {
  const paths = new Set();
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await client
      .from("attachments")
      .select("storage_path")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    data.forEach((row) => paths.add(row.storage_path));
    if (data.length < PAGE) return paths;
  }
}

// Sem linha em attachments e criado há mais de 24 horas: as 24 horas protegem um envio em andamento.
/** @returns {Promise<StoredObject[]>} */
export async function findOrphans(
  client,
  { prefix = "", now = Date.now() } = {},
) {
  const [objects, registered] = await Promise.all([
    listObjects(client, prefix),
    registeredPaths(client),
  ]);
  return objects.filter(
    (o) => !registered.has(o.path) && now - Date.parse(o.createdAt) > DAY,
  );
}

// Só apaga com a palavra exata; devolve quantos apagou.
export async function applyOrphans(client, orphans, answer) {
  if (answer.trim() !== CONFIRM || !orphans.length) return 0;
  let removed = 0;
  for (let i = 0; i < orphans.length; i += 100) {
    const batch = orphans.slice(i, i + 100).map((o) => o.path);
    const { data, error } = await client.storage.from(BUCKET).remove(batch);
    if (error) throw error;
    removed += data.length;
  }
  return removed;
}

// Baixa cada objeto para dir/<caminho>; no fim confere contagem e bytes contra o Storage.
export async function backup(client, dir, { prefix = "" } = {}) {
  const objects = await listObjects(client, prefix);
  let bytes = 0;
  for (const o of objects) {
    const { data, error } = await client.storage.from(BUCKET).download(o.path);
    if (error) throw new Error(`não baixou ${o.path}: ${error.message}`);
    const file = join(dir, o.path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, Buffer.from(await data.arrayBuffer()));
    bytes += statSync(file).size;
  }
  const expected = objects.reduce((sum, o) => sum + o.size, 0);
  if (bytes !== expected)
    throw new Error(`backup incompleto: ${bytes} de ${expected} bytes`);
  // O tipo vai junto: o bucket recusa o envio sem ele na restauração.
  writeFileSync(join(dir, MANIFEST), JSON.stringify(objects, null, 2));
  return { count: objects.length, bytes };
}

// Envia de volta o que o manifest lista, nos mesmos caminhos. upsert: o data.sql pode já trazer a linha do objeto.
export async function restore(client, dir) {
  /** @type {StoredObject[]} */
  const objects = JSON.parse(readFileSync(join(dir, MANIFEST), "utf8"));
  for (const o of objects) {
    const { error } = await client.storage
      .from(BUCKET)
      .upload(o.path, readFileSync(join(dir, o.path)), {
        contentType: o.type,
        upsert: true,
      });
    if (error) throw new Error(`não enviou ${o.path}: ${error.message}`);
  }
  return { count: objects.length };
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no terminal.",
    );
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function main([command, ...args]) {
  const client = adminClient();
  if (command === "orphans") {
    const orphans = await findOrphans(client);
    orphans.forEach((o) =>
      console.log(`${o.path}  ${o.size} B  ${o.createdAt}`),
    );
    console.log(
      `${orphans.length} arquivo(s) sem registro há mais de 24 horas.`,
    );
    if (!args.includes("--apply") || !orphans.length) return;
    const rl = createInterface({ input: stdin, output: stdout });
    const answer = await rl.question(
      `Digite "${CONFIRM}" para remover de vez: `,
    );
    rl.close();
    const removed = await applyOrphans(client, orphans, answer);
    console.log(removed ? `${removed} removido(s).` : "Nada removido.");
    return;
  }
  if (command === "backup") {
    if (!args[0])
      throw new Error("Informe a pasta: npm run storage:backup -- <pasta>");
    const dir = resolve(args[0]);
    // Os anexos têm dados da empresa: nunca dentro do repositório.
    const inside = relative(process.cwd(), dir);
    if (!inside.startsWith("..") && !isAbsolute(inside))
      throw new Error("Escolha uma pasta fora do repositório.");
    const { count, bytes } = await backup(client, dir);
    console.log(
      `${count} arquivo(s), ${bytes} bytes, em ${dir}. Contagem e tamanho conferem.`,
    );
    return;
  }
  if (command === "restore") {
    if (!args[0])
      throw new Error("Informe a pasta: npm run storage:restore -- <pasta>");
    const { count } = await restore(client, resolve(args[0]));
    console.log(
      `${count} arquivo(s) enviados para ${process.env.NEXT_PUBLIC_SUPABASE_URL}.`,
    );
    return;
  }
  throw new Error(
    "Comando: orphans [--apply] | backup <pasta> | restore <pasta>",
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
