import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const layout = readFileSync("src/app/layout.tsx", "utf8");
const globals = readFileSync("src/app/globals.css", "utf8");

test("the app loads Geist and no longer loads Fraunces, Inter or JetBrains Mono", () => {
  expect(layout).toMatch(/Geist\b.*from "next\/font\/google"/);
  expect(layout).not.toMatch(/Fraunces|Inter\b|JetBrains/);
});

test("display and body fonts both resolve to Geist", () => {
  expect(globals).toMatch(/--mcv-font-display:\s*var\(--font-geist\)/);
  expect(globals).toMatch(/--mcv-font-body:\s*var\(--font-geist\)/);
});

test("titles are tight but never past the -0.04em tracking floor", () => {
  const m = globals.match(
    /h1,\s*h2,\s*h3\s*\{[^}]*letter-spacing:\s*(-?[\d.]+)em/,
  );
  expect(m).not.toBeNull();
  expect(Number(m![1])).toBeLessThan(0);
  expect(Number(m![1])).toBeGreaterThanOrEqual(-0.04);
});
