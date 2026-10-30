import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const layout = readFileSync("src/app/layout.tsx", "utf8");
const globals = readFileSync("src/app/globals.css", "utf8");

test("the app loads Space Grotesk and IBM Plex Mono and no longer loads Geist", () => {
  const imported = layout.match(
    /import \{([^}]*)\} from "next\/font\/google"/,
  )![1];
  expect(imported).toMatch(/\bSpace_Grotesk\b/);
  expect(imported).toMatch(/\bIBM_Plex_Mono\b/);
  expect(layout).not.toMatch(/Geist|Fraunces|Inter\b|JetBrains/);
});

test("display and body fonts resolve to Space Grotesk, numbers to IBM Plex Mono", () => {
  expect(globals).toMatch(/--mc-fonte-display:\s*var\(--font-display\)/);
  expect(globals).toMatch(/--mc-fonte-texto:\s*var\(--font-display\)/);
  expect(globals).toMatch(/--mc-fonte-mono:\s*var\(--font-mono\)/);
});

// A última font-family declarada para o seletor, em qualquer regra que o liste, é a que vale.
const lastFontFamily = (selector: string) => {
  let last = "";
  for (const [, selectors, body] of globals.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!selectors.split(",").some((s) => s.trim() === selector)) continue;
    const m = body.match(/font-family:\s*([^;]+);/);
    if (m) last = m[1].trim();
  }
  return last;
};

test("counts, dates and step numbers use the mono family", () => {
  for (const sel of [
    ".resume-meta",
    ".state-count b",
    ".project-counts b",
    ".board-column h2 b",
    ".detail-now-count",
  ]) {
    expect(lastFontFamily(sel), sel).toBe("var(--mc-fonte-mono)");
  }
});

test("the brand has no italics", () => {
  expect(globals).not.toMatch(/font-style:\s*italic/);
});

test("titles are tight but never past the -0.04em tracking floor", () => {
  const m = globals.match(
    /h1,\s*h2,\s*h3\s*\{[^}]*letter-spacing:\s*(-?[\d.]+)em/,
  );
  expect(m).not.toBeNull();
  expect(Number(m![1])).toBeLessThan(0);
  expect(Number(m![1])).toBeGreaterThanOrEqual(-0.04);
});
