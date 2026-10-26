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
