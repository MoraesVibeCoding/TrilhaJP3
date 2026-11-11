// T11: anexos (tasks/t11-spec.md, seções 3 e 4). Bucket privado, caminho por empresa, o banco confere o Storage.
import { afterAll, beforeAll, expect, test } from "vitest";
import { admin, fixture, type TestUser } from "./fixture";

const { run, cleanup, createUser, createOrg } = fixture("t11");
const BUCKET = "attachments";

let a: TestUser;
let c: TestUser; // outro membro da empresa A
let b: TestUser;
let orgA: string;
let orgB: string;
let taskA: string;
let subtaskA: string;
let taskB: string;
const uploaded: string[] = [];

async function insert(user: TestUser, table: string, row: object) {
  const { data, error } = await user.client
    .from(table)
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

const pathFor = (org: string, task: string, name: string) =>
  `${org}/${task}/${crypto.randomUUID()}-${name}`;

async function upload(
  user: TestUser,
  path: string,
  type: string,
  bytes = 2048,
) {
  const result = await user.client.storage
    .from(BUCKET)
    .upload(path, new Blob([new Uint8Array(bytes)], { type }), {
      contentType: type,
    });
  if (!result.error) uploaded.push(path);
  return result;
}

// O arquivo existe no Storage? Lido com a chave de serviço, sem passar pelo cache do download.
async function stored(path: string) {
  const folder = path.slice(0, path.lastIndexOf("/"));
  const { data, error } = await admin.storage.from(BUCKET).list(folder);
  if (error) throw error;
  return data.some((o) => path.endsWith(`/${o.name}`));
}

const attach = (
  user: TestUser,
  path: string,
  fileName: string,
  extra: object = {},
) =>
  user.client
    .from("attachments")
    .insert({
      organization_id: orgA,
      task_id: taskA,
      storage_path: path,
      file_name: fileName,
      ...extra,
    })
    .select("*")
    .single();

beforeAll(async () => {
  a = await createUser("a");
  c = await createUser("c");
  b = await createUser("b");
  orgA = await createOrg("Empresa A", a.id);
  orgB = await createOrg("Empresa B", b.id);
  const member = await admin
    .from("memberships")
    .insert({ organization_id: orgA, user_id: c.id, role: "member" });
  if (member.error) throw member.error;
  const projectA = await insert(a, "projects", {
    organization_id: orgA,
    name: `Site ${run}`,
  });
  taskA = (
    await insert(a, "tasks", {
      organization_id: orgA,
      project_id: projectA.id,
      title: `Demanda ${run}`,
    })
  ).id;
  subtaskA = (
    await insert(a, "tasks", {
      organization_id: orgA,
      project_id: projectA.id,
      parent_task_id: taskA,
      title: `Passo ${run}`,
    })
  ).id;
  const projectB = await insert(b, "projects", {
    organization_id: orgB,
    name: `Loja ${run}`,
  });
  taskB = (
    await insert(b, "tasks", {
      organization_id: orgB,
      project_id: projectB.id,
      title: `Demanda B ${run}`,
    })
  ).id;
}, 60_000);

afterAll(async () => {
  if (uploaded.length) await admin.storage.from(BUCKET).remove(uploaded);
  await cleanup();
}, 60_000);

test("o bucket recusa tipo fora da lista e arquivo acima de 10 MB", async () => {
  const svg = await upload(a, pathFor(orgA, taskA, "x.svg"), "image/svg+xml");
  expect(svg.error).not.toBeNull();
  const exe = await upload(
    a,
    pathFor(orgA, taskA, "x.exe"),
    "application/x-msdownload",
  );
  expect(exe.error).not.toBeNull();
  const big = await upload(
    a,
    pathFor(orgA, taskA, "grande.pdf"),
    "application/pdf",
    10 * 1024 * 1024 + 1,
  );
  expect(big.error).not.toBeNull();
});

test("o banco grava tamanho e tipo do Storage, e autor e nome da sessão", async () => {
  const path = pathFor(orgA, taskA, "contrato.pdf");
  expect((await upload(a, path, "application/pdf", 4096)).error).toBeNull();
  // O cliente tenta mentir sobre tamanho e tipo: as colunas nem aceitam.
  const lied = await attach(a, path, "contrato.pdf", {
    size_bytes: 1,
    mime_type: "image/png",
  });
  expect(lied.error?.code).toBe("42501");
  const { data, error } = await attach(a, path, "contrato.pdf");
  expect(error).toBeNull();
  expect(data).toMatchObject({
    file_name: "contrato.pdf",
    mime_type: "application/pdf",
    size_bytes: 4096,
    uploaded_by: a.id,
    uploader_name: `t11-a-${run}`,
  });
});

test("extensão proibida é recusada mesmo com tipo aceito", async () => {
  const path = pathFor(orgA, taskA, "virus.exe");
  expect((await upload(a, path, "image/png")).error).toBeNull();
  const { error } = await attach(a, path, "virus.exe");
  expect(error?.code).toBe("23514");
});

test("a linha só entra se o arquivo existe no caminho da própria demanda", async () => {
  const missing = await attach(
    a,
    pathFor(orgA, taskA, "nao-enviado.pdf"),
    "nao-enviado.pdf",
  );
  expect(missing.error?.code).toBe("23514");

  // Arquivo de verdade, mas em outra demanda: não vale para esta.
  const elsewhere = pathFor(orgA, subtaskA, "outro.pdf");
  expect((await upload(a, elsewhere, "application/pdf")).error).toBeNull();
  const wrongTask = await attach(a, elsewhere, "outro.pdf");
  expect(wrongTask.error?.code).toBe("23514");
});

test("anexo em subtarefa é recusado", async () => {
  const path = pathFor(orgA, subtaskA, "passo.pdf");
  expect((await upload(a, path, "application/pdf")).error).toBeNull();
  const { error } = await attach(a, path, "passo.pdf", { task_id: subtaskA });
  expect(error?.code).toBe("23514");
});

test("membro de outra empresa não envia, não lê e não apaga", async () => {
  const intruder = await upload(
    b,
    pathFor(orgA, taskA, "intruso.pdf"),
    "application/pdf",
  );
  expect(intruder.error).not.toBeNull();

  const path = pathFor(orgA, taskA, "privado.pdf");
  expect((await upload(a, path, "application/pdf")).error).toBeNull();
  const { data } = await attach(a, path, "privado.pdf");

  const row = await b.client
    .from("attachments")
    .select("id")
    .eq("id", data!.id);
  expect(row.data).toEqual([]);
  const file = await b.client.storage.from(BUCKET).download(path);
  expect(file.error).not.toBeNull();
  const signed = await b.client.storage.from(BUCKET).createSignedUrl(path, 60);
  expect(signed.error).not.toBeNull();
  await b.client.storage.from(BUCKET).remove([path]);
  expect(await stored(path)).toBe(true);

  // Nem anexar na própria empresa um arquivo que está na pasta de outra.
  const crossed = await b.client.from("attachments").insert({
    organization_id: orgB,
    task_id: taskB,
    storage_path: path,
    file_name: "privado.pdf",
  });
  expect(crossed.error).not.toBeNull();
});

test("outro membro lê e abre, mas só quem enviou apaga a linha e o arquivo", async () => {
  const path = pathFor(orgA, taskA, "foto.png");
  expect((await upload(a, path, "image/png")).error).toBeNull();
  const { data } = await attach(a, path, "foto.png");

  const seen = await c.client
    .from("attachments")
    .select("id")
    .eq("id", data!.id);
  expect(seen.data).toEqual([{ id: data!.id }]);
  const signed = await c.client.storage.from(BUCKET).createSignedUrl(path, 60);
  expect(signed.error).toBeNull();

  const byOther = await c.client
    .from("attachments")
    .delete()
    .eq("id", data!.id)
    .select("id");
  expect(byOther.data).toEqual([]);
  await c.client.storage.from(BUCKET).remove([path]);
  expect(await stored(path)).toBe(true);

  const byAuthor = await a.client
    .from("attachments")
    .delete()
    .eq("id", data!.id)
    .select("id");
  expect(byAuthor.data).toEqual([{ id: data!.id }]);
  const removed = await a.client.storage.from(BUCKET).remove([path]);
  expect(removed.data).toHaveLength(1);
  // Conferido no Storage, não por download: o CDN pode servir por alguns segundos a cópia já baixada.
  expect(await stored(path)).toBe(false);
});

test("anexar e remover entram no histórico com o nome do arquivo", async () => {
  const path = pathFor(orgA, taskA, "planilha.xlsx");
  expect(
    (
      await upload(
        a,
        path,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      )
    ).error,
  ).toBeNull();
  const { data } = await attach(a, path, "planilha.xlsx");
  await a.client.from("attachments").delete().eq("id", data!.id);

  const { data: events } = await admin
    .from("task_events")
    .select("type, changes")
    .eq("task_id", taskA)
    .in("type", ["attachment_added", "attachment_removed"])
    .contains("changes", { name: "planilha.xlsx" })
    .order("id");
  expect(events).toEqual([
    { type: "attachment_added", changes: { name: "planilha.xlsx" } },
    { type: "attachment_removed", changes: { name: "planilha.xlsx" } },
  ]);
});
