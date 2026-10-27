import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const layout = readFileSync("src/app/layout.tsx", "utf8");
const globals = readFileSync("src/app/globals.css", "utf8");

test("the app loads Space Grotesk and IBM Plex Mono, and no longer Geist", () => {
  const fonts = layout.match(
    /import \{([^}]*)\} from "next\/font\/google"/,
  )![1];
  expect(fonts).toMatch(/\bSpace_Grotesk\b/);
  expect(fonts).toMatch(/\bIBM_Plex_Mono\b/);
  expect(layout).not.toMatch(/Geist/);
  expect(layout).not.toMatch(/Fraunces|Inter\b|JetBrains/);
});

test("display and body use Space Grotesk; numbers and labels use IBM Plex Mono", () => {
  expect(globals).toMatch(/--mcv-font-display:\s*var\(--font-space-grotesk\)/);
  expect(globals).toMatch(/--mcv-font-body:\s*var\(--font-space-grotesk\)/);
  expect(globals).toMatch(/--mcv-font-mono:\s*var\(--font-ibm-plex-mono\)/);
});

// decisão 2 da spec da marca: contagens, datas, "Passo N de M", cabeçalhos de tabela e selos
test("counts, dates, steps, table headers and badges are set in tabular Plex Mono", () => {
  const rule = globals
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .match(
      /([^{}]+)\{\s*font-family:\s*var\(--mcv-font-mono\);\s*font-variant-numeric:\s*tabular-nums;/,
    );
  expect(rule).not.toBeNull();
  const selectors = rule![1].split(",").map((s) => s.trim());
  for (const s of [
    ".state-count b",
    ".board-column h2 b",
    ".detail-now-count",
    ".resume-meta",
    ".demands-count",
    ".project-counts",
    "thead th",
    ".badge",
    "kbd",
  ]) {
    expect(selectors).toContain(s);
  }
});

test("titles are tight but never past the -0.04em tracking floor", () => {
  const m = globals.match(
    /h1,\s*h2,\s*h3\s*\{[^}]*letter-spacing:\s*(-?[\d.]+)em/,
  );
  expect(m).not.toBeNull();
  expect(Number(m![1])).toBeLessThan(0);
  expect(Number(m![1])).toBeGreaterThanOrEqual(-0.04);
});
