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
  expect(globals).toMatch(/--mc-texto-apoio:\s*var\(--mc-apoio\)/);
  const soft = light("mc-apoio", tokens);
  for (const bg of ["mc-fundo", "mc-superficie-suave", "mc-superficie"]) {
    expect(ratio(soft, light(bg, tokens))).toBeGreaterThanOrEqual(4.5);
  }
});

test("no text color in globals uses the brand stone token directly", () => {
  expect(globals).not.toMatch(/color:\s*var\(--mc-apoio\)/);
});

const darkBlock = tokens.slice(tokens.indexOf(':root[data-theme="dark"]'));
const dark = (name: string) =>
  darkBlock.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))![1];

test("control borders reach 3:1 against the page in both themes (WCAG 1.4.11)", () => {
  expect(globals).toMatch(/--mc-borda-controle:\s*var\(--mc-apoio\)/);
  expect(
    ratio(light("mc-apoio", tokens), light("mc-fundo", tokens)),
  ).toBeGreaterThanOrEqual(3);
  expect(ratio(dark("mc-apoio"), dark("mc-fundo"))).toBeGreaterThanOrEqual(3);
});

test("the dialog scrim is a token, with its own dark value", () => {
  expect(globals).toMatch(/--mc-veu:/);
  const darkSection = globals.slice(globals.indexOf('[data-theme="dark"]'));
  expect(darkSection).toMatch(/--mc-veu:/);
});

test("no color is hard-coded outside the token declarations", () => {
  const offenders = globals
    .split("\n")
    .filter((line) => /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(line))
    .filter((line) => !/^\s*--mc-[\w-]+:/.test(line))
    .filter((line) => !/^\s*\/\*.*\*\/\s*$/.test(line));
  expect(offenders).toEqual([]);
});

// Marca Moraes Coding (docs/brand/moraes-coding/tokens.json), spec em tasks/marca-spec.md.
test("light tokens follow the Moraes Coding palette (Claro, Gelo)", () => {
  expect(light("mc-fundo", tokens)).toBe("#f2f2ee");
  expect(light("mc-superficie", tokens)).toBe("#ffffff");
  expect(light("mc-superficie-suave", tokens)).toBe("#e6ece7");
  expect(light("mc-texto", tokens)).toBe("#08180f");
  expect(light("mc-texto-titulo", tokens)).toBe("#0c2a1e");
  expect(light("mc-alta", tokens)).toBe("#14704a");
  expect(light("mc-apoio", tokens)).toBe("#5c625e");
  expect(light("mc-borda", tokens)).toBe("#d6ded8");
  expect(light("mc-atencao", tokens)).toBe("#e3b23c");
  expect(light("mc-destaque", tokens)).toBe("#b83300");
});

test("dark tokens follow the Moraes Coding palette (Escuro, Mata)", () => {
  expect(dark("mc-fundo")).toBe("#0c2a1e");
  expect(dark("mc-superficie")).toBe("#08180f");
  expect(dark("mc-texto")).toBe("#e6ece7");
  expect(dark("mc-texto-titulo")).toBe("#e6ece7");
  expect(dark("mc-borda")).toBe("#24412f");
  expect(dark("mc-destaque")).toBe("#ff5a1f");
});

test("the system dark theme and the forced dark theme carry the same values", () => {
  const media = tokens.slice(
    tokens.indexOf("@media (prefers-color-scheme: dark)"),
    tokens.indexOf(':root[data-theme="dark"]'),
  );
  for (const name of ["mc-fundo", "mc-superficie", "mc-texto", "mc-destaque"]) {
    expect(media).toContain(`--${name}: ${dark(name)};`);
  }
});

test("text and headings reach 4.5:1 on every ground in both themes", () => {
  for (const fg of ["mc-texto", "mc-texto-titulo"]) {
    for (const bg of ["mc-fundo", "mc-superficie", "mc-superficie-suave"]) {
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
    .match(/--mc-texto-apoio:\s*(#[0-9a-fA-F]{6})/)![1];
  for (const bg of ["mc-fundo", "mc-superficie", "mc-superficie-suave"]) {
    expect(ratio(soft, dark(bg))).toBeGreaterThanOrEqual(4.5);
  }
});

test("Alta (leaf) reaches 4.5:1 on paper, card and mint, but stays a border or underline", () => {
  for (const bg of ["mc-fundo", "mc-superficie", "mc-superficie-suave"]) {
    expect(
      ratio(light("mc-alta", tokens), light(bg, tokens)),
    ).toBeGreaterThanOrEqual(4.5);
  }
  expect(globals).not.toMatch(/(^|[^-])color:\s*var\(--mc-alta\)/m);
});

test("Mata carries Gelo text on buttons (7:1) in light mode", () => {
  expect(
    ratio(light("mc-fundo", tokens), light("mc-texto-titulo", tokens)),
  ).toBeGreaterThanOrEqual(7);
});

test("the signal reaches 4.5:1 on its grounds and is only a fill (once per screen)", () => {
  for (const bg of ["mc-fundo", "mc-superficie"]) {
    expect(
      ratio(light("mc-destaque", tokens), light(bg, tokens)),
    ).toBeGreaterThanOrEqual(4.5);
    expect(ratio(dark("mc-destaque"), dark(bg))).toBeGreaterThanOrEqual(4.5);
  }
  // o Sinal claro (#FF5A1F) dá 2,8:1 sobre o Gelo: no tema claro só vale o Sinal escuro
  expect(tokens.slice(0, tokens.indexOf("@media"))).not.toMatch(/#ff5a1f/i);
  expect(globals).not.toMatch(
    /(^|[^-])(color|border[\w-]*|outline[\w-]*):[^;]*var\(--mc-destaque\)/m,
  );
});

test("focus ring is the signal at 3px, offset 3px (3:1 on every ground)", () => {
  expect(globals).toMatch(/--mc-foco:\s*var\(--mc-destaque\)/);
  expect(globals).not.toMatch(/outline:\s*2px solid var\(--mc-foco\)/);
  expect(globals).toMatch(/outline:\s*3px solid var\(--mc-foco\)/);
});

test("the brand has no shadows: the only box-shadow is the 1px ring of a pressed count", () => {
  const shadows = [...globals.matchAll(/box-shadow:\s*([^;]+);/g)].map((m) =>
    m[1].trim(),
  );
  expect(shadows).toEqual(["0 0 0 1px var(--mc-texto)"]);
});

test("Mostarda is a fill only: never text or border (1.8:1 on Gelo)", () => {
  expect(globals).not.toMatch(
    /(^|[^-])(color|border[\w-]*|outline[\w-]*):[^;]*var\(--mc-atencao\)/m,
  );
});
