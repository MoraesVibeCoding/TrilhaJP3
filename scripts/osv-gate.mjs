#!/usr/bin/env node
// CONSTRAINTS.md, "Segurança das dependências, segunda opinião": nada Alto ou acima (CVSS 7 ou mais).
// O osv-scanner não tem limite de severidade: este script roda ele em JSON e aplica a regra.
// Médio e abaixo aparecem no log e não bloqueiam. Uso: node scripts/osv-gate.mjs. Saída: 0 ok, 1 bloqueou.
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const HIGH = 7;

// "pacote@versão id (nota)" de cada grupo que bloqueia; nota vazia conta como alta.
export function blocking(report) {
  const found = [];
  for (const result of report.results ?? [])
    for (const { package: pkg, groups = [] } of result.packages ?? [])
      for (const g of groups) {
        const score = Number.parseFloat(g.max_severity);
        if (Number.isNaN(score) || score >= HIGH)
          found.push(
            `${pkg.name}@${pkg.version} ${g.ids[0]} (${g.max_severity || "sem nota"})`,
          );
      }
  return found;
}

function main() {
  const run = spawnSync(
    "osv-scanner",
    ["scan", "source", "-r", ".", "--format", "json"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  // 0 = nada achado, 1 = achou algo; qualquer outro código é erro do próprio scanner.
  if (run.status !== 0 && run.status !== 1) {
    console.error(run.stderr || run.error?.message);
    process.exit(1);
  }
  const report = JSON.parse(run.stdout || "{}");
  const found = blocking(report);
  for (const r of report.results ?? [])
    for (const p of r.packages ?? [])
      for (const g of p.groups ?? [])
        console.log(
          `${p.package.name}@${p.package.version} ${g.ids[0]} (${g.max_severity || "sem nota"})`,
        );
  found.forEach((line) => console.error(`bloqueia: ${line}`));
  console.log(`osv-scanner: ${found.length} achado(s) Alto ou acima.`);
  process.exit(found.length ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main();
