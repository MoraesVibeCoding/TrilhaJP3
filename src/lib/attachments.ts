// T11: regras dos anexos no navegador e no servidor (tasks/t11-spec.md, seção 2). O banco confere de novo.
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

// A mesma lista do bucket (migração 20261111120000_attachments) e do gatilho, pela extensão.
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
  txt: "text/plain",
  csv: "text/csv",
};

// Para o atributo accept do campo de arquivo.
export const ACCEPTED = Object.keys(TYPES)
  .map((ext) => `.${ext}`)
  .join(",");

const extensionOf = (name: string) =>
  /\.([a-z0-9]+)$/i.exec(name)?.[1].toLowerCase() ?? "";

// O tipo enviado ao Storage vem da extensão: o navegador às vezes diz outro (CSV como planilha no Windows).
export const contentTypeOf = (name: string): string | undefined =>
  TYPES[extensionOf(name)];

// A mensagem do aviso, ou null quando o arquivo pode ser enviado.
export function checkFile(file: { name: string; size: number }): string | null {
  if (!contentTypeOf(file.name))
    return `Tipo de arquivo não aceito: ${file.name}.`;
  if (file.size === 0) return `${file.name} está vazio.`;
  if (file.size > MAX_ATTACHMENT_BYTES) return `${file.name} passa de 10 MB.`;
  return null;
}

// O Storage só aceita letras sem acento, números, espaço e alguns sinais no nome do objeto.
const MAX_NAME = 120;
export function safeName(name: string) {
  const plain = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 _\-.',!*&$@=;:+?()]/g, "_");
  if (plain.length <= MAX_NAME) return plain;
  const ext = /\.[a-z0-9]+$/i.exec(plain)?.[0] ?? "";
  return plain.slice(0, MAX_NAME - ext.length) + ext;
}

// Espaço inseparável: o número não fica numa linha e a unidade em outra.
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}\u00a0B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}\u00a0KB`;
  return `${decimal.format(bytes / (1024 * 1024))}\u00a0MB`;
}

export const isImage = (mime: string) => mime.startsWith("image/");
// Imagem e PDF abrem em outra aba; documentos de escritório e texto são baixados.
export const opensInBrowser = (mime: string) =>
  isImage(mime) || mime === "application/pdf";
