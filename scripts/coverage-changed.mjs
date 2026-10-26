#!/usr/bin/env node
// Cobertura das linhas alteradas (CONSTRAINTS.md): cruza coverage/lcov.info com o diff da branch.
// Uso: npx vitest run --coverage && node scripts/coverage-changed.mjs [--base origin/main] [--min 80]
// Saída: 0 ok (ou nada a medir), 1 abaixo do mínimo, 2 não conseguiu rodar.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { relative } from "node:path";
import { pathToFileURL } from "node:url";

export function parseLcov(text, root) {
  const files = new Map();
  let lines = null;
  for (const row of text.split("\n")) {
    if (row.startsWith("SF:")) {
      lines = new Map();
      const path = row.slice(3);
      files.set(path.startsWith("/") ? relative(root, path) : path, lines);
    } else if (row.startsWith("DA:") && lines) {
      const [n, hits] = row.slice(3).split(",");
      lines.set(Number(n), Number(hits));
    }
  }
  return files;
}

export function parseDiff(diff) {
  const changed = new Map();
  let file = null;
  let next = 0;
  for (const row of diff.split("\n")) {
    if (row.startsWith("+++ ")) {
      file = row === "+++ /dev/null" ? null : row.slice(4).replace(/^b\//, "");
      if (file && !changed.has(file)) changed.set(file, new Set());
    } else if (row.startsWith("@@")) {
      next = Number(/\+(\d+)/.exec(row)?.[1] ?? 0);
    } else if (file && row.startsWith("+")) {
      changed.get(file).add(next++);
    }
  }
  return changed;
}

export function measure(coverage, changed) {
  let covered = 0;
  let total = 0;
  const uncovered = [];
  for (const [file, set] of changed) {
    const lines = coverage.get(file);
    if (!lines) continue; // sem dado de cobertura (css, md): fora da conta
    for (const n of [...set].sort((a, b) => a - b)) {
      if (!lines.has(n)) continue; // linha não executável
      total++;
      if (lines.get(n) > 0) covered++;
      else uncovered.push(`${file}:${n}`);
    }
  }
  return { covered, total, uncovered };
}

function main() {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf(name);
    return i > -1 ? process.argv[i + 1] : fallback;
  };
  const base = arg("--base", "origin/main");
  const min = Number(arg("--min", "80"));
  const git = (args) =>
    execFileSync("git", args, {
      encoding: "utf8",
      maxBuffer: 512 * 1024 * 1024,
    });
  try {
    const root = git(["rev-parse", "--show-toplevel"]).trim();
    if (!existsSync("coverage/lcov.info"))
      throw new Error(
        "coverage/lcov.info não existe: rode vitest com --coverage",
      );
    const mergeBase = git(["merge-base", base, "HEAD"]).trim();
    const changed = parseDiff(
      git(["diff", "--unified=0", mergeBase, "--", "src"]),
    );
    for (const f of git(["ls-files", "--others", "--exclude-standard", "src"])
      .split("\n")
      .filter(Boolean)) {
      const n = readFileSync(f, "utf8").split("\n").length;
      changed.set(f, new Set(Array.from({ length: n }, (_, i) => i + 1)));
    }
    const { covered, total, uncovered } = measure(
      parseLcov(readFileSync("coverage/lcov.info", "utf8"), root),
      changed,
    );
    if (total === 0)
      return console.log(
        "coverage-changed: nada executável alterado para medir",
      );
    const pct = (covered / total) * 100;
    console.log(
      `coverage-changed: ${covered}/${total} linhas alteradas cobertas (${pct.toFixed(1)}%, mínimo ${min}%)`,
    );
    if (pct < min) {
      console.error("sem cobertura:\n  " + uncovered.slice(0, 20).join("\n  "));
      process.exit(1);
    }
  } catch (e) {
    console.error("coverage-changed: " + e.message);
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main();
