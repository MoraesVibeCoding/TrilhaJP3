// T13: órfãos e backup dos anexos (tasks/t13-spec.md, seção 2, itens 3 e 4).
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";
import {
  applyOrphans,
  backup,
  findOrphans,
  listObjects,
  restore,
} from "../../scripts/storage.mjs";
import { admin, fixture, type TestUser } from "./fixture";

const { run, cleanup, createUser, createOrg } = fixture("t13");
const BUCKET = "attachments";
const DAY = 24 * 60 * 60 * 1000;

let a: TestUser;
let org: string;
let task: string;
let registered: string; // com linha em attachments
let orphan: string; // sem linha
const uploaded: string[] = [];

async function upload(path: string, bytes: number) {
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(
      path,
      new Blob([new Uint8Array(bytes).fill(7)], { type: "application/pdf" }),
      {
        contentType: "application/pdf",
      },
    );
  if (error) throw error;
  uploaded.push(path);
}

beforeAll(async () => {
  a = await createUser("a");
  org = await createOrg("Empresa", a.id);
  const project = await a.client
    .from("projects")
    .insert({ organization_id: org, name: `Site ${run}` })
    .select("id")
    .single();
  if (project.error) throw project.error;
  const demand = await a.client
    .from("tasks")
    .insert({
      organization_id: org,
      project_id: project.data.id,
      title: `Demanda ${run}`,
    })
    .select("id")
    .single();
  if (demand.error) throw demand.error;
  task = demand.data.id;
  registered = `${org}/${task}/${crypto.randomUUID()}-contrato.pdf`;
  orphan = `${org}/${task}/${crypto.randomUUID()}-perdido.pdf`;
  await upload(registered, 3000);
  await upload(orphan, 1000);
  const row = await a.client.from("attachments").insert({
    organization_id: org,
    task_id: task,
    storage_path: registered,
    file_name: "contrato.pdf",
  });
  if (row.error) throw row.error;
}, 60_000);

afterAll(async () => {
  await admin.storage.from(BUCKET).remove(uploaded);
  await cleanup();
}, 60_000);

test("lista os objetos de todas as pastas, com tamanho e data", async () => {
  const objects = await listObjects(admin, `${org}/`);
  expect(objects.map((o) => o.path).sort()).toEqual(
    [registered, orphan].sort(),
  );
  expect(objects.find((o) => o.path === orphan)).toMatchObject({ size: 1000 });
  expect(objects.every((o) => !Number.isNaN(Date.parse(o.createdAt)))).toBe(
    true,
  );
});

test("órfão é só o objeto sem linha e com mais de 24 horas", async () => {
  // agora: o órfão acabou de subir, pode ser um envio em andamento
  expect(await findOrphans(admin, { prefix: `${org}/` })).toEqual([]);
  // daqui a 25 horas: o órfão entra, o registrado não
  const later = await findOrphans(admin, {
    prefix: `${org}/`,
    now: Date.now() + DAY + 60 * 60 * 1000,
  });
  expect(later.map((o) => o.path)).toEqual([orphan]);
});

test("--apply sem digitar 'apagar' não apaga nada; com a confirmação, apaga só os órfãos", async () => {
  const orphans = await findOrphans(admin, {
    prefix: `${org}/`,
    now: Date.now() + 2 * DAY,
  });
  expect(await applyOrphans(admin, orphans, "sim")).toBe(0);
  expect(await applyOrphans(admin, orphans, "")).toBe(0);
  expect((await listObjects(admin, `${org}/`)).length).toBe(2);

  expect(await applyOrphans(admin, orphans, "apagar")).toBe(1);
  expect((await listObjects(admin, `${org}/`)).map((o) => o.path)).toEqual([
    registered,
  ]);
});

test("o backup baixa os objetos com os mesmos caminhos, confere contagem e tamanho, e a restauração devolve o arquivo", async () => {
  const dir = mkdtempSync(join(tmpdir(), "t13-backup-"));
  try {
    const result = await backup(admin, dir, { prefix: `${org}/` });
    expect(result).toEqual({ count: 1, bytes: 3000 });
    expect(readFileSync(join(dir, registered)).length).toBe(3000);
    expect(
      JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")),
    ).toEqual([
      expect.objectContaining({
        path: registered,
        size: 3000,
        type: "application/pdf",
      }),
    ]);

    // perde o arquivo e restaura do backup
    const removed = await admin.storage.from(BUCKET).remove([registered]);
    expect(removed.error).toBeNull();
    expect(await listObjects(admin, `${org}/`)).toEqual([]);
    expect(await restore(admin, dir)).toEqual({ count: 1 });
    expect(await listObjects(admin, `${org}/`)).toEqual([
      expect.objectContaining({
        path: registered,
        size: 3000,
        type: "application/pdf",
      }),
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
