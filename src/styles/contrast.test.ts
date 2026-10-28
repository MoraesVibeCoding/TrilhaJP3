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
  expect(globals).toMatch(/--mcv-text-soft:\s*var\(--mcv-stone\)/);
  const soft = light("mcv-stone", tokens);
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

// Marca Moraes Coding (docs/brand/moraes-coding/tokens.json), spec em tasks/marca-spec.md.
test("light tokens follow the Moraes Coding palette (Claro, Gelo)", () => {
  expect(light("mcv-paper", tokens)).toBe("#f2f2ee");
  expect(light("mcv-card", tokens)).toBe("#ffffff");
  expect(light("mcv-mint", tokens)).toBe("#e6ece7");
  expect(light("mcv-ink", tokens)).toBe("#08180f");
  expect(light("mcv-forest", tokens)).toBe("#0c2a1e");
  expect(light("mcv-leaf", tokens)).toBe("#14704a");
  expect(light("mcv-stone", tokens)).toBe("#5c625e");
  expect(light("mcv-line", tokens)).toBe("#d6ded8");
  expect(light("mcv-gold", tokens)).toBe("#e3b23c");
  expect(light("mcv-pulse", tokens)).toBe("#b83300");
});

test("dark tokens follow the Moraes Coding palette (Escuro, Mata)", () => {
  expect(dark("mcv-paper")).toBe("#0c2a1e");
  expect(dark("mcv-card")).toBe("#08180f");
  expect(dark("mcv-ink")).toBe("#e6ece7");
  expect(dark("mcv-forest")).toBe("#e6ece7");
  expect(dark("mcv-line")).toBe("#24412f");
  expect(dark("mcv-pulse")).toBe("#ff5a1f");
});

test("the system dark theme and the forced dark theme carry the same values", () => {
  const media = tokens.slice(
    tokens.indexOf("@media (prefers-color-scheme: dark)"),
    tokens.indexOf(':root[data-theme="dark"]'),
  );
  for (const name of ["mcv-paper", "mcv-card", "mcv-ink", "mcv-pulse"]) {
    expect(media).toContain(`--${name}: ${dark(name)};`);
  }
});

test("text and headings reach 4.5:1 on every ground in both themes", () => {
  for (const fg of ["mcv-ink", "mcv-forest"]) {
    for (const bg of ["mcv-paper", "mcv-card", "mcv-mint"]) {
      expect(
        ratio(light(fg, tokens), light(bg, tokens)),
      ).toBeGreaterThanOrEqual(4.5);
      expect(ratio(dark(fg), dark(bg))).toBeGreaterThanOrEqual(4.5);
    }
  }
});

test("soft text meets 4.5:1 on every ground in dark mode", () => {
  const soft = globals
    .slice(globals.indexOf(':root[data-theme="dark"]'))
    .match(/--mcv-text-soft:\s*(#[0-9a-fA-F]{6})/)![1];
  for (const bg of ["mcv-paper", "mcv-card", "mcv-mint"]) {
    expect(ratio(soft, dark(bg))).toBeGreaterThanOrEqual(4.5);
  }
});

test("Alta (leaf) reaches 4.5:1 on paper, card and mint, but stays a border or underline", () => {
  for (const bg of ["mcv-paper", "mcv-card", "mcv-mint"]) {
    expect(
      ratio(light("mcv-leaf", tokens), light(bg, tokens)),
    ).toBeGreaterThanOrEqual(4.5);
  }
  expect(globals).not.toMatch(/(^|[^-])color:\s*var\(--mcv-leaf\)/m);
});

test("Mata carries Gelo text on buttons (7:1) in light mode", () => {
  expect(
    ratio(light("mcv-paper", tokens), light("mcv-forest", tokens)),
  ).toBeGreaterThanOrEqual(7);
});

test("the signal reaches 4.5:1 on its grounds and is only a fill (once per screen)", () => {
  for (const bg of ["mcv-paper", "mcv-card"]) {
    expect(
      ratio(light("mcv-pulse", tokens), light(bg, tokens)),
    ).toBeGreaterThanOrEqual(4.5);
    expect(ratio(dark("mcv-pulse"), dark(bg))).toBeGreaterThanOrEqual(4.5);
  }
  // o Sinal claro (#FF5A1F) dá 2,8:1 sobre o Gelo: no tema claro só vale o Sinal escuro
  expect(tokens.slice(0, tokens.indexOf("@media"))).not.toMatch(/#ff5a1f/i);
  expect(globals).not.toMatch(
    /(^|[^-])(color|border[\w-]*|outline[\w-]*):[^;]*var\(--mcv-pulse\)/m,
  );
});

test("focus ring is the signal at 3px, offset 3px (3:1 on every ground)", () => {
  expect(globals).toMatch(/--mcv-focus:\s*var\(--mcv-pulse\)/);
  expect(globals).not.toMatch(/outline:\s*2px solid var\(--mcv-focus\)/);
  expect(globals).toMatch(/outline:\s*3px solid var\(--mcv-focus\)/);
});

test("the brand has no shadows", () => {
  for (const m of globals.matchAll(/--mcv-shadow:\s*([^;]+);/g)) {
    expect(m[1].trim()).toBe("none");
  }
});

test("Mostarda is a fill only: never text or border (1.8:1 on Gelo)", () => {
  expect(globals).not.toMatch(
    /(^|[^-])(color|border[\w-]*|outline[\w-]*):[^;]*var\(--mcv-gold\)/m,
  );
});
