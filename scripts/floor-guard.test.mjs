import { afterEach, expect, test } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const guard = resolve("scripts/floor-guard.mjs");
const dirs = [];
afterEach(() =>
  dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })),
);

const git = (cwd, ...args) =>
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], {
    cwd,
    stdio: "ignore",
  });

function repo() {
  const dir = mkdtempSync(join(tmpdir(), "guard-"));
  dirs.push(dir);
  git(dir, "init", "-q");
  mkdirSync(join(dir, "src"));
  writeFileSync(join(dir, "src/a.ts"), "export const a = 1;\n");
  writeFileSync(
    join(dir, "CONSTRAINTS.md"),
    "- Coverage: changed lines >= 80% covered\n",
  );
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "base");
  return dir;
}
const run = (cwd) =>
  spawnSync("node", [guard, "--base", "HEAD"], { cwd, encoding: "utf8" });

test("a clean change exits 0", () => {
  const dir = repo();
  writeFileSync(join(dir, "src/b.ts"), "export const b = 2;\n");
  expect(run(dir).status).toBe(0);
});

test("a new suppression comment in untracked code exits 1 and names the rule", () => {
  const dir = repo();
  writeFileSync(
    join(dir, "src/b.ts"),
    "// @ts-ignore\nexport const b: number = 'x';\n",
  );
  const r = run(dir);
  expect(r.status).toBe(1);
  expect(r.stderr).toContain("silenced-checker");
});

test("a skipped database test under supabase/ is caught", () => {
  const dir = repo();
  mkdirSync(join(dir, "supabase/tests"), { recursive: true });
  writeFileSync(
    join(dir, "supabase/tests/rls.test.ts"),
    "test.skip('x', () => {});\n",
  );
  const r = run(dir);
  expect(r.status).toBe(1);
  expect(r.stderr).toContain("test-made-easier");
});

test("an empty catch and a skipped test are caught", () => {
  const dir = repo();
  writeFileSync(join(dir, "src/c.ts"), "try { x(); } catch {}\n");
  writeFileSync(join(dir, "src/c.test.ts"), "test.skip('x', () => {});\n");
  const r = run(dir);
  expect(r.status).toBe(1);
  expect(r.stderr).toContain("unfinished-work");
  expect(r.stderr).toContain("test-made-easier");
});

test("lowering a threshold in CONSTRAINTS.md exits 1, raising it stays quiet", () => {
  const dir = repo();
  writeFileSync(
    join(dir, "CONSTRAINTS.md"),
    "- Coverage: changed lines >= 70% covered\n",
  );
  expect(run(dir).status).toBe(1);
  writeFileSync(
    join(dir, "CONSTRAINTS.md"),
    "- Coverage: changed lines >= 90% covered\n",
  );
  expect(run(dir).status).toBe(0);
});

test("outside a git repository it exits 2, never 0", () => {
  const dir = mkdtempSync(join(tmpdir(), "nogit-"));
  dirs.push(dir);
  expect(run(dir).status).toBe(2);
});

test("lowering a coverage threshold in vitest.config.mts is caught; raising it is silent", () => {
  const dir = repo();
  const config = (n) =>
    `export default { test: { coverage: { thresholds: {\n  lines: ${n},\n  branches: 90,\n} } } };\n`;
  writeFileSync(join(dir, "vitest.config.mts"), config(96.6));
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "config");

  writeFileSync(join(dir, "vitest.config.mts"), config(97));
  expect(run(dir).status).toBe(0);

  writeFileSync(join(dir, "vitest.config.mts"), config(50));
  const r = run(dir);
  expect(r.status).toBe(1);
  expect(r.stderr).toContain("threshold-loosened");
  expect(r.stderr).toContain("vitest.config.mts");
});

test("deleting a coverage threshold in vitest.config.mts is caught", () => {
  const dir = repo();
  writeFileSync(
    join(dir, "vitest.config.mts"),
    "export default { test: { coverage: { thresholds: {\n  lines: 96.6,\n} } } };\n",
  );
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "config");
  writeFileSync(
    join(dir, "vitest.config.mts"),
    "export default { test: { coverage: {} } };\n",
  );
  const r = run(dir);
  expect(r.status).toBe(1);
  expect(r.stderr).toContain("threshold-removed");
});

// Exceções registradas na tabela do CONSTRAINTS.md (decisão do Pedro em 2026-11-07).
function repoWithAssertion() {
  const dir = repo();
  mkdirSync(join(dir, "e2e"));
  writeFileSync(
    join(dir, "e2e/x.spec.ts"),
    "test('x', () => { expect(page.getByText(name)).toHaveCount(0); });\n",
  );
  writeFileSync(
    join(dir, "CONSTRAINTS.md"),
    "- Coverage: changed lines >= 80% covered\n\n## Exceções\n\n| ID | Regra | Caminho | Motivo | Dono | Expira |\n| --- | --- | --- | --- | --- | --- |\n",
  );
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "assertion");
  writeFileSync(
    join(dir, "e2e/x.spec.ts"),
    "test('x', () => { expect(list.getByText(name)).toHaveCount(0); });\n",
  );
  return dir;
}
const exception = (dir, row) =>
  writeFileSync(
    join(dir, "CONSTRAINTS.md"),
    `- Coverage: changed lines >= 80% covered\n\n## Exceções\n\n| ID | Regra | Caminho | Motivo | Dono | Expira |\n| --- | --- | --- | --- | --- | --- |\n${row}\n`,
  );
const future = new Date(Date.now() + 10 * 86_400_000)
  .toISOString()
  .slice(0, 10);
const past = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
const trecho = "`expect(page.getByText(name)).toHaveCount(0);`";

test("without an exception, the changed assertion fails", () => {
  const r = run(repoWithAssertion());
  expect(r.status).toBe(1);
  expect(r.stderr).toContain("assertion-removed");
});

test("a valid exception lets only that line through, and says so", () => {
  const dir = repoWithAssertion();
  exception(
    dir,
    `| E1 | assertion-removed | e2e/x.spec.ts | O histórico mostra o nome: ${trecho} | Pedro | ${future} |`,
  );
  const r = run(dir);
  expect(r.status).toBe(0);
  expect(r.stdout).toContain("E1");
});

test("an expired exception does not count", () => {
  const dir = repoWithAssertion();
  exception(
    dir,
    `| E1 | assertion-removed | e2e/x.spec.ts | ${trecho} | Pedro | ${past} |`,
  );
  expect(run(dir).status).toBe(1);
});

test("an exception for another line or file does not count", () => {
  const dir = repoWithAssertion();
  exception(
    dir,
    `| E1 | assertion-removed | e2e/x.spec.ts | \`expect(outra).toBe(1);\` | Pedro | ${future} |`,
  );
  expect(run(dir).status).toBe(1);
  exception(
    dir,
    `| E1 | assertion-removed | e2e/y.spec.ts | ${trecho} | Pedro | ${future} |`,
  );
  expect(run(dir).status).toBe(1);
});

test("an exception row without owner, quoted line or date still fails as new-exception", () => {
  const dir = repoWithAssertion();
  exception(dir, "| E1 | assertion-removed | e2e/x.spec.ts | sem trecho | | |");
  const r = run(dir);
  expect(r.status).toBe(1);
  expect(r.stderr).toContain("new-exception");
});
