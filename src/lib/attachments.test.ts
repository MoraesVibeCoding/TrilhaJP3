import { expect, test } from "vitest";
import {
  checkFile,
  contentTypeOf,
  formatSize,
  isImage,
  opensInBrowser,
  safeName,
} from "./attachments";

const MB = 1024 * 1024;

test("aceita só a lista da spec, pela extensão, sem diferenciar maiúsculas", () => {
  for (const name of [
    "foto.JPG",
    "print.png",
    "a.webp",
    "a.gif",
    "iphone.HEIC",
    "contrato.pdf",
    "a.doc",
    "a.docx",
    "a.xls",
    "a.xlsx",
    "a.ppt",
    "a.pptx",
    "a.odt",
    "a.ods",
    "a.odp",
    "notas.txt",
    "dados.csv",
  ])
    expect(checkFile({ name, size: 10 })).toBeNull();
  for (const name of [
    "virus.exe",
    "logo.svg",
    "pagina.html",
    "script.js",
    "sem-extensao",
    "foto.png.exe",
  ])
    expect(checkFile({ name, size: 10 })).toBe(
      `Tipo de arquivo não aceito: ${name}.`,
    );
});

test("recusa arquivo vazio e acima de 10 MB", () => {
  expect(checkFile({ name: "a.pdf", size: 10 * MB })).toBeNull();
  expect(checkFile({ name: "a.pdf", size: 10 * MB + 1 })).toBe(
    "a.pdf passa de 10 MB.",
  );
  expect(checkFile({ name: "a.pdf", size: 0 })).toBe("a.pdf está vazio.");
});

test("o tipo enviado ao Storage vem da extensão, não do navegador", () => {
  expect(contentTypeOf("planilha.CSV")).toBe("text/csv");
  expect(contentTypeOf("a.docx")).toBe(
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  expect(contentTypeOf("a.exe")).toBeUndefined();
});

test("o nome no caminho só usa caracteres que o Storage aceita", () => {
  expect(safeName("Proposta Comercial (v2).pdf")).toBe(
    "Proposta Comercial (v2).pdf",
  );
  expect(safeName("orçamento #3 – São Paulo/ok.pdf")).toBe(
    "orcamento _3 _ Sao Paulo_ok.pdf",
  );
  expect(safeName(`${"a".repeat(200)}.pdf`)).toHaveLength(120);
  expect(safeName(`${"a".repeat(200)}.pdf`).endsWith(".pdf")).toBe(true);
});

test("tamanho legível em pt-BR", () => {
  expect(formatSize(800)).toBe("800 B");
  expect(formatSize(1536)).toBe("2 KB");
  expect(formatSize(2.44 * MB)).toBe("2,4 MB");
  expect(formatSize(10 * MB)).toBe("10 MB");
});

test("imagem tem miniatura; imagem e PDF abrem no navegador, o resto é baixado", () => {
  expect(isImage("image/png")).toBe(true);
  expect(isImage("application/pdf")).toBe(false);
  expect(opensInBrowser("image/jpeg")).toBe(true);
  expect(opensInBrowser("application/pdf")).toBe(true);
  expect(opensInBrowser("text/plain")).toBe(false);
  expect(opensInBrowser("application/vnd.ms-excel")).toBe(false);
});
