import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const tokens = readFileSync("src/styles/tokens.css", "utf8");
const globals = readFileSync("src/app/globals.css", "utf8");

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const light = (name: string, css: string) =>
  css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))![1];

test("soft text meets WCAG AA (4.5:1) on paper, mint and card in light mode", () => {
  const soft = light("mcv-text-soft", globals);
  for (const bg of ["mcv-paper", "mcv-mint", "mcv-card"]) {
    expect(ratio(soft, light(bg, tokens))).toBeGreaterThanOrEqual(4.5);
  }
});

test("no text color in globals uses the brand stone token directly", () => {
  expect(globals).not.toMatch(/color:\s*var\(--mcv-stone\)/);
});

const darkBlock = tokens.slice(tokens.indexOf(':root[data-theme="dark"]'));
const dark = (name: string) =>
  darkBlock.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))![1];

test("control borders reach 3:1 against the page in both themes (WCAG 1.4.11)", () => {
  expect(globals).toMatch(/--mcv-control-line:\s*var\(--mcv-stone\)/);
  expect(
    ratio(light("mcv-stone", tokens), light("mcv-paper", tokens)),
  ).toBeGreaterThanOrEqual(3);
  expect(ratio(dark("mcv-stone"), dark("mcv-paper"))).toBeGreaterThanOrEqual(3);
});

test("the dialog scrim and the shadow are tokens, with their own dark values", () => {
  expect(globals).toMatch(/--mcv-scrim:/);
  expect(globals).toMatch(/--mcv-shadow:/);
  const darkSection = globals.slice(globals.indexOf('[data-theme="dark"]'));
  expect(darkSection).toMatch(/--mcv-scrim:/);
});

test("no color is hard-coded outside the token declarations", () => {
  const offenders = globals
    .split("\n")
    .filter((line) => /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(line))
    .filter((line) => !/^\s*--mcv-[\w-]+:/.test(line))
    .filter((line) => !/^\s*\/\*.*\*\/\s*$/.test(line));
  expect(offenders).toEqual([]);
});

// Marca V2 (docs/brand/evolucao/tokens-v2.json), decisões do Pedro de 2026-10-23.
test("light tokens follow the brand V2 palette", () => {
  expect(light("mcv-ink", tokens)).toBe("#0f1f14");
  expect(light("mcv-forest", tokens)).toBe("#1b4d2e");
  expect(light("mcv-leaf", tokens)).toBe("#2f7d4b");
  expect(light("mcv-mint", tokens)).toBe("#edf4e7");
  expect(light("mcv-paper", tokens)).toBe("#f8faf5");
  expect(light("mcv-gold", tokens)).toBe("#d4892a");
  expect(light("mcv-pulse", tokens)).toBe("#a6f26b");
});

test("the dark ground is the brand Tinta", () => {
  expect(dark("mcv-paper")).toBe("#0f1f14");
  expect(dark("mcv-pulse")).toBe("#a6f26b");
});

test("Folha (leaf) reaches 4.5:1 as text on paper and card; on mint it is 4.5 at best", () => {
  for (const bg of ["mcv-paper", "mcv-card"]) {
    expect(
      ratio(light("mcv-leaf", tokens), light(bg, tokens)),
    ).toBeGreaterThanOrEqual(4.5);
  }
  // sobre a Neblina fica em 4,497:1: só como borda ou sublinhado, nunca como cor de texto
  expect(globals).not.toMatch(/(^|[^-])color:\s*var\(--mcv-leaf\)/m);
});

test("Floresta carries paper text on buttons (7:1) in light mode", () => {
  expect(
    ratio(light("mcv-paper", tokens), light("mcv-forest", tokens)),
  ).toBeGreaterThanOrEqual(7);
});

test("the lime pulse is only used on dark grounds (Floresta and Tinta)", () => {
  const pulse = light("mcv-pulse", tokens);
  expect(ratio(pulse, light("mcv-forest", tokens))).toBeGreaterThanOrEqual(4.5);
  expect(ratio(pulse, dark("mcv-paper"))).toBeGreaterThanOrEqual(4.5);
  // sobre o papel claro ele reprova (1,29:1): nenhuma regra pode usá-lo como texto ou borda
  expect(globals).not.toMatch(
    /(^|[^-])(color|border[\w-]*|outline[\w-]*):[^;]*var\(--mcv-pulse\)/m,
  );
});

test("Âmbar is a fill only: never text or border (2.7:1 on paper)", () => {
  expect(globals).not.toMatch(
    /(^|[^-])(color|border[\w-]*|outline[\w-]*):[^;]*var\(--mcv-gold\)/m,
  );
});
