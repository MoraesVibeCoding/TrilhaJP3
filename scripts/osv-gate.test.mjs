import { expect, test } from "vitest";
import { blocking } from "./osv-gate.mjs";

const report = (...groups) => ({
  results: [
    {
      packages: [
        {
          package: { name: "pacote", version: "1.0.0", ecosystem: "npm" },
          groups,
        },
      ],
    },
  ],
});
const group = (id, max_severity) => ({ ids: [id], max_severity });

test("bloqueia só o que é Alto ou acima (CVSS 7 ou mais), a regra do CONSTRAINTS.md", () => {
  expect(
    blocking(
      report(
        group("GHSA-medio", "6.9"),
        group("GHSA-alto", "7.0"),
        group("GHSA-critico", "9.8"),
      ),
    ),
  ).toEqual([
    "pacote@1.0.0 GHSA-alto (7.0)",
    "pacote@1.0.0 GHSA-critico (9.8)",
  ]);
});

test("severidade desconhecida bloqueia: pode ser alta", () => {
  expect(blocking(report(group("GHSA-sem-nota", "")))).toEqual([
    "pacote@1.0.0 GHSA-sem-nota (sem nota)",
  ]);
});

test("relatório sem achados passa", () => {
  expect(blocking({ results: [] })).toEqual([]);
  expect(blocking({})).toEqual([]);
});
