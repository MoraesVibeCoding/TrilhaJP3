import { expect, test } from "vitest";
import { measure, parseDiff, parseLcov } from "./coverage-changed.mjs";

const lcov = `SF:/repo/src/a.ts
DA:1,1
DA:2,0
DA:3,1
end_of_record
SF:/repo/src/b.ts
DA:1,0
end_of_record
`;

test("parseLcov reads hits per line, with paths made relative to the repo", () => {
  const files = parseLcov(lcov, "/repo");
  expect(files.get("src/a.ts").get(2)).toBe(0);
  expect(files.get("src/a.ts").get(3)).toBe(1);
  expect(files.has("src/b.ts")).toBe(true);
});

test("parseDiff collects the added line numbers of each file", () => {
  const diff = [
    "diff --git a/src/a.ts b/src/a.ts",
    "--- a/src/a.ts",
    "+++ b/src/a.ts",
    "@@ -1,0 +2,2 @@",
    "+x",
    "+y",
    "@@ -9 +12 @@",
    "-old",
    "+new",
  ].join("\n");
  expect([...parseDiff(diff).get("src/a.ts")]).toEqual([2, 3, 12]);
});

test("measure counts only changed lines that are executable", () => {
  const changed = new Map([["src/a.ts", new Set([1, 2, 9])]]); // 9 não é executável
  const r = measure(parseLcov(lcov, "/repo"), changed);
  expect(r).toEqual({ covered: 1, total: 2, uncovered: ["src/a.ts:2"] });
});

test("files without coverage data are ignored, not counted as zero", () => {
  const changed = new Map([["src/novo.css", new Set([1, 2])]]);
  expect(measure(parseLcov(lcov, "/repo"), changed).total).toBe(0);
});
