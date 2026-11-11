import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

// As ações e o envio ficam pendentes até o teste decidir.
const pending: ((v: unknown) => void)[] = [];
const wait = () => new Promise((resolve) => pending.push(resolve));
const actions = vi.hoisted(() => ({
  prepareAttachment: vi.fn(),
  addAttachment: vi.fn(),
  removeAttachment: vi.fn(),
  attachmentUrl: vi.fn(),
  thumbnailUrls: vi.fn(),
}));
vi.mock("@/app/(app)/demandas/actions", () => actions);
const storage = vi.hoisted(() => ({ upload: vi.fn() }));
vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({ storage: { from: () => storage } }),
}));

const { AttachmentList } = await import("./attachment-list");

const now = new Date(2026, 10, 11, 16, 0);
const attachments = [
  {
    id: "f2",
    name: "print-topo.png",
    mime: "image/png",
    size: 248000,
    author: "pedro",
    at: new Date(2026, 10, 11, 10, 0).toISOString(),
    mine: true,
  },
  {
    id: "f1",
    name: "contrato.pdf",
    mime: "application/pdf",
    size: 2.44 * 1024 * 1024,
    author: "ana",
    at: new Date(2026, 10, 10, 17, 0).toISOString(),
    mine: false,
  },
];

const settle = (value: unknown) =>
  act(async () => {
    pending.splice(0).forEach((resolve) => resolve(value));
    await new Promise((r) => setTimeout(r, 0));
  });

beforeEach(() => {
  for (const a of Object.values(actions))
    a.mockReset().mockImplementation(wait);
  actions.thumbnailUrls.mockResolvedValue({ f2: "https://x/miniatura" });
  storage.upload.mockReset().mockImplementation(wait);
});
afterEach(async () => {
  await settle(true);
  cleanup();
});

const setup = (list = attachments) =>
  render(
    <AttachmentList
      taskId="t1"
      attachments={list}
      now={now}
      heading={(n) => <h2>Anexos ({n})</h2>}
    />,
  );
const sending = () => document.querySelector(".attachment-sending")!;
const items = () => within(screen.getByRole("list")).getAllByRole("listitem");
const pick = (...files: File[]) =>
  fireEvent.change(screen.getByLabelText("Escolher arquivos"), {
    target: { files },
  });
const file = (name: string, bytes = 10, type = "") =>
  new File([new Uint8Array(bytes)], name, { type });

test("lista do mais novo ao mais antigo, com miniatura nas imagens, o tipo nos outros, tamanho, autor e data", async () => {
  setup();
  expect(screen.getByRole("heading", { name: "Anexos (2)" })).toBeTruthy();
  await settle(true);
  expect(actions.thumbnailUrls).toHaveBeenCalledWith("t1");
  const [image, pdf] = items();
  expect(
    within(image)
      .getByRole("img", { name: "print-topo.png" })
      .getAttribute("src"),
  ).toBe("https://x/miniatura");
  expect(image.textContent).toContain("242 KB · Você · hoje, 10h");
  expect(within(pdf).queryByRole("img")).toBeNull();
  expect(pdf.textContent).toContain("PDF");
  expect(pdf.textContent).toContain("2,4 MB · ana · ontem, 17h");
});

test("sem anexos, diz que não há; a regra de tipos fica ao lado do botão", () => {
  setup([]);
  expect(screen.getByText("Nenhum anexo.")).toBeTruthy();
  expect(screen.getByText("Imagens, PDF e documentos, até 10 MB")).toBeTruthy();
  expect(actions.thumbnailUrls).not.toHaveBeenCalled();
});

test("enviar: prepara o caminho, sobe o arquivo direto ao Storage com o tipo da extensão e registra", async () => {
  setup();
  actions.prepareAttachment.mockResolvedValue({
    path: "org/t1/u-a.csv",
    contentType: "text/csv",
  });
  pick(file("dados.csv", 20, "application/vnd.ms-excel"));
  expect(sending().textContent).toBe("Enviando dados.csv…");
  await settle(true);
  expect(actions.prepareAttachment).toHaveBeenCalledWith("t1", "dados.csv", 20);
  expect(storage.upload).toHaveBeenCalledWith(
    "org/t1/u-a.csv",
    expect.any(File),
    { contentType: "text/csv" },
  );
  await settle({ error: null });
  expect(actions.addAttachment).toHaveBeenCalledWith(
    "t1",
    "org/t1/u-a.csv",
    "dados.csv",
  );
  await settle(true);
  expect(sending().textContent).toBe("");
});

test("arquivo recusado no navegador não chega ao servidor; os outros seguem", async () => {
  setup();
  actions.prepareAttachment.mockResolvedValue({
    path: "org/t1/u-a.pdf",
    contentType: "application/pdf",
  });
  pick(
    file("virus.exe"),
    file("grande.pdf", 10 * 1024 * 1024 + 1),
    file("ok.pdf"),
  );
  expect(screen.getByRole("alert").textContent).toBe(
    "Tipo de arquivo não aceito: virus.exe. grande.pdf passa de 10 MB.",
  );
  await settle(true);
  expect(actions.prepareAttachment).toHaveBeenCalledTimes(1);
  expect(actions.prepareAttachment).toHaveBeenCalledWith("t1", "ok.pdf", 10);
});

test("falha no envio avisa e não registra", async () => {
  setup();
  actions.prepareAttachment.mockResolvedValue({
    path: "org/t1/u-a.pdf",
    contentType: "application/pdf",
  });
  pick(file("a.pdf"));
  await settle(true);
  await settle({ error: { message: "mime type not supported" } });
  expect(actions.addAttachment).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toBe(
    "Não foi possível enviar a.pdf. Tente de novo.",
  );
});

test("abrir pede o link assinado e o abre na aba já aberta pelo clique", async () => {
  const tab = { location: { href: "" }, opener: {}, close: vi.fn() };
  const open = vi.spyOn(window, "open").mockReturnValue(tab as never);
  setup();
  fireEvent.click(screen.getByRole("button", { name: "contrato.pdf" }));
  expect(open).toHaveBeenCalledWith("", "_blank");
  expect(actions.attachmentUrl).toHaveBeenCalledWith("f1");
  await settle("https://x/assinado");
  expect(tab.location.href).toBe("https://x/assinado");
  expect(tab.opener).toBeNull();
  open.mockRestore();
});

test("se o link não vier, a aba fecha e avisa", async () => {
  const tab = { location: { href: "" }, opener: {}, close: vi.fn() };
  const open = vi.spyOn(window, "open").mockReturnValue(tab as never);
  setup();
  fireEvent.click(screen.getByRole("button", { name: "contrato.pdf" }));
  await settle(null);
  expect(tab.close).toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toBe(
    "Não foi possível abrir contrato.pdf. Tente de novo.",
  );
  open.mockRestore();
});

test("só os próprios anexos têm Remover, com confirmação; Esc fecha só a confirmação", async () => {
  setup();
  const remove = screen.getAllByRole("button", { name: /^Remover / });
  expect(remove).toHaveLength(1);
  fireEvent.click(remove[0]);
  expect(
    within(items()[0]).getByRole("group", { name: "Remover este anexo?" }),
  ).toBeTruthy();
  const outer = vi.fn();
  document.addEventListener("keydown", outer);
  fireEvent.keyDown(remove[0], { key: "Escape" });
  expect(screen.queryByText("Remover este anexo?")).toBeNull();
  expect(outer).not.toHaveBeenCalled();
  document.removeEventListener("keydown", outer);
  expect(document.activeElement).toBe(remove[0]);

  fireEvent.click(remove[0]);
  fireEvent.click(screen.getByRole("button", { name: "Remover" }));
  expect(actions.removeAttachment).toHaveBeenCalledWith("f2");
  expect(items()).toHaveLength(1);
  await settle(true);
});

test("se não remover, o anexo volta e avisa", async () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: /^Remover / }));
  fireEvent.click(screen.getByRole("button", { name: "Remover" }));
  await settle(false);
  expect(items()).toHaveLength(2);
  expect(screen.getByRole("alert").textContent).toBe(
    "Não foi possível salvar. Tente de novo.",
  );
});
