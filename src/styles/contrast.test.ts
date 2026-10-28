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
  const soft = light("mcv-text-soft", tokens);
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

test("the dialog scrim is a token with its own dark value", () => {
  expect(globals).toMatch(/--mcv-scrim:/);
  const darkSection = globals.slice(globals.indexOf('[data-theme="dark"]'));
  expect(darkSection).toMatch(/--mcv-scrim:/);
});

// Design system Moraes Coding: sem sombras e sem gradientes; a profundidade vem da troca de superfície.
test("no shadow or gradient anywhere", () => {
  expect(globals).not.toMatch(/box-shadow|--mcv-shadow|gradient\(/);
});

test("no color is hard-coded outside the token declarations", () => {
  const offenders = globals
    .split("\n")
    .filter((line) => /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(line))
    .filter((line) => !/^\s*--mcv-[\w-]+:/.test(line))
    .filter((line) => !/^\s*\/\*.*\*\/\s*$/.test(line));
  expect(offenders).toEqual([]);
});

// Design system Moraes Coding (tokens semânticos), tasks/tm-spec.md seção 3, aprovado em 2026-10-27.
test("light tokens follow the Moraes Coding design system", () => {
  expect(light("mcv-paper", tokens)).toBe("#f2f2ee"); // fundo: Gelo
  expect(light("mcv-card", tokens)).toBe("#ffffff"); // superficie: branco
  expect(light("mcv-mint", tokens)).toBe("#e6ece7"); // superficie-suave: Névoa
  expect(light("mcv-ink", tokens)).toBe("#08180f"); // texto: Noite
  expect(light("mcv-forest", tokens)).toBe("#0c2a1e"); // texto-titulo: Mata
  expect(light("mcv-text-soft", tokens)).toBe("#5c625e"); // texto-apoio
  expect(light("mcv-line", tokens)).toBe("#d6ded8"); // borda
  expect(light("mcv-stone", tokens)).toBe("#5c625e"); // borda-controle
  expect(light("mcv-alta", tokens)).toBe("#14704a"); // botão alta
  expect(light("mcv-destaque", tokens)).toBe("#b83300"); // Sinal escuro
});

test("the dark theme is Mata with Noite surfaces and the Sinal highlight", () => {
  expect(dark("mcv-paper")).toBe("#0c2a1e");
  expect(dark("mcv-card")).toBe("#08180f");
  expect(dark("mcv-mint")).toBe("#08180f");
  expect(dark("mcv-ink")).toBe("#e6ece7");
  expect(dark("mcv-forest")).toBe("#e6ece7");
  expect(dark("mcv-text-soft")).toBe("#b9ccc1");
  expect(dark("mcv-line")).toBe("#24412f");
  expect(dark("mcv-stone")).toBe("#9db5a8");
  expect(dark("mcv-destaque")).toBe("#ff5a1f");
});

test("text, titles and the highlight reach 4.5:1 on page and surfaces in both themes", () => {
  for (const pick of [(n: string) => light(n, tokens), dark]) {
    for (const fg of [
      "mcv-ink",
      "mcv-forest",
      "mcv-text-soft",
      "mcv-destaque",
    ]) {
      for (const bg of ["mcv-paper", "mcv-card", "mcv-mint"]) {
        expect(ratio(pick(fg), pick(bg))).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});

test("the focus ring is the highlight, 3px wide and 3px away (design system foco)", () => {
  expect(globals).toMatch(/--mcv-focus:\s*var\(--mcv-destaque\)/);
  expect(globals).toMatch(
    /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--mcv-focus\);[^}]*outline-offset:\s*3px/,
  );
});

test("the primary button is Alta with Gelo text in both themes (5.4:1)", () => {
  expect(
    ratio(light("mcv-on-alta", tokens), light("mcv-alta", tokens)),
  ).toBeGreaterThanOrEqual(4.5);
  expect(globals).toMatch(
    /\.primary-button\s*\{[^}]*background:\s*var\(--mcv-alta\);[^}]*color:\s*var\(--mcv-on-alta\)/,
  );
  // o tema escuro não redefine o botão: Alta e Gelo valem nos dois
  expect(darkBlock).not.toMatch(/--mcv-alta:|--mcv-on-alta:/);
});

test("the Sinal orange appears once per screen: the current step, the Fazendo count", () => {
  const uses = globals.match(/color:\s*var\(--mcv-destaque\)/g) ?? [];
  expect(uses).toHaveLength(3);
  expect(globals).toMatch(
    /\.detail-now-count\s*\{[^}]*color:\s*var\(--mcv-destaque\)/,
  );
  expect(globals).toMatch(
    /\.state-count\[data-state="Fazendo"\] b\s*\{[^}]*color:\s*var\(--mcv-destaque\)/,
  );
  expect(globals).toMatch(
    /\.board-column\[data-state="Fazendo"\] h2 b\s*\{[^}]*color:\s*var\(--mcv-destaque\)/,
  );
});

test("links and underlines use Alta, which reaches 4.5:1 on page and card", () => {
  for (const bg of ["mcv-paper", "mcv-card"]) {
    expect(
      ratio(light("mcv-leaf", tokens), light(bg, tokens)),
    ).toBeGreaterThanOrEqual(4.5);
  }
  // Alta fica para sublinhados, bordas e o selo Fazendo, nunca como cor de texto corrido
  expect(globals).not.toMatch(/(^|[^-])color:\s*var\(--mcv-leaf\)/m);
});

// a faixa da entrada é Mata (texto-titulo) com texto Névoa/Gelo
test("Floresta carries paper text on buttons (7:1) in light mode", () => {
  expect(
    ratio(light("mcv-paper", tokens), light("mcv-forest", tokens)),
  ).toBeGreaterThanOrEqual(7);
});

test("Mostarda is a fill only: never text or border (1.8:1 on Gelo)", () => {
  expect(light("mcv-gold", tokens)).toBe("#e3b23c");
  expect(globals).not.toMatch(
    /(^|[^-])(color|border[\w-]*|outline[\w-]*):[^;]*var\(--mcv-gold\)/m,
  );
});

test("the lime pulse left the app (decision 1 of the brand spec)", () => {
  expect(tokens + globals).not.toMatch(/--mcv-pulse|#a6f26b/i);
});

// Proposta 2 do impeccable (aprovada em 2026-10-27): topo e barra lateral em Mata no claro, Noite no escuro.
test("the shell chrome is Mata in light and Noite in dark, and its text, borders and focus read on it", () => {
  expect(light("mcv-chrome-bg", tokens)).toBe("#0c2a1e");
  expect(dark("mcv-chrome-bg")).toBe("#08180f");
  // o escuro só redefine o fundo e o item atual; o resto do chrome vale nos dois temas
  const darkOrLight = (n: string) =>
    new RegExp(`--${n}:`).test(darkBlock) ? dark(n) : light(n, tokens);
  for (const pick of [(n: string) => light(n, tokens), darkOrLight]) {
    for (const bg of ["mcv-chrome-bg", "mcv-chrome-current"]) {
      for (const fg of [
        "mcv-chrome-ink",
        "mcv-chrome-soft",
        "mcv-chrome-focus",
      ]) {
        expect(ratio(pick(fg), pick(bg))).toBeGreaterThanOrEqual(4.5);
      }
      expect(
        ratio(pick("mcv-chrome-control"), pick(bg)),
      ).toBeGreaterThanOrEqual(3);
    }
  }
  // a janela de captura e o aviso moram no topo, mas não herdam as cores dele
  expect(globals).toMatch(/\.shell-bar > :not\(dialog, \.capture-toast\)/);
});

// Proposta 1 do impeccable: um só botão cheio por tela; "Nova demanda" é fantasma a partir de 60rem.
test("Nova demanda is a ghost button from 60rem up", () => {
  expect(globals).toMatch(
    /@media \(min-width: 60rem\) \{\s*\.capture-button \{[^}]*background: transparent;[^}]*border: 1\.5px solid var\(--mcv-control-line\)/,
  );
});
