import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

// As ações ficam pendentes até o teste decidir: dá para ver a mudança otimista no meio.
const pending: ((v: unknown) => void)[] = [];
const wait = () => new Promise((resolve) => pending.push(resolve));
const actions = vi.hoisted(() => ({
  addComment: vi.fn(),
  archiveComment: vi.fn(),
}));
vi.mock("@/app/(app)/demandas/actions", () => actions);

const { CommentThread } = await import("./comment-thread");

const now = new Date(2026, 10, 3, 16, 0);
const comments = [
  {
    id: "c1",
    author: "ana",
    at: new Date(2026, 10, 2, 17, 0).toISOString(),
    text: "Cliente pediu outra foto.\nMandou por e-mail.",
    mine: false,
  },
  {
    id: "c2",
    author: "pedro",
    at: new Date(2026, 10, 3, 9, 0).toISOString(),
    text: 'Veja https://exemplo.com.br/a. <script>alert(1)</script> <img src=x onerror="alert(1)"> javascript:alert(1)',
    mine: true,
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
});
afterEach(async () => {
  await settle(true);
  cleanup();
});

const setup = (list = comments) =>
  render(
    <section>
      <CommentThread
        taskId="t1"
        comments={list}
        now={now}
        heading={(n) => <h2>Comentários ({n})</h2>}
      />
    </section>,
  );
const field = () =>
  screen.getByRole("textbox", {
    name: "Novo comentário",
  }) as HTMLTextAreaElement;
const items = () => within(screen.getByRole("list")).getAllByRole("listitem");

test("lista do mais antigo ao mais novo, com autor, hora e o próprio como Você", () => {
  setup();
  expect(screen.getByRole("heading", { name: "Comentários (2)" })).toBeTruthy();
  expect(items()).toHaveLength(2);
  expect(items()[0].textContent).toContain("ana");
  expect(items()[0].textContent).toContain("ontem, 17h");
  expect(items()[1].textContent).toContain("Você");
  expect(items()[1].textContent).toContain("hoje, 9h");
});

test("mantém as quebras de linha e mostra HTML como texto; só https vira link", () => {
  const { container } = setup();
  expect(items()[0].querySelector(".comment-body")!.textContent).toBe(
    "Cliente pediu outra foto.\nMandou por e-mail.",
  );
  expect(container.querySelector("script, img")).toBeNull();
  expect(items()[1].textContent).toContain("<script>alert(1)</script>");
  const links = within(items()[1]).getAllByRole("link");
  expect(links).toHaveLength(1);
  expect(links[0].getAttribute("href")).toBe("https://exemplo.com.br/a");
  expect(links[0].getAttribute("target")).toBe("_blank");
  expect(links[0].getAttribute("rel")).toBe("noopener noreferrer");
});

test("sem comentários, diz que não há", () => {
  setup([]);
  expect(screen.getByText("Nenhum comentário.")).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Comentários (0)" })).toBeTruthy();
});

test("Comentar publica na hora, limpa o campo e deixa o foco nele", async () => {
  setup();
  fireEvent.change(field(), { target: { value: "  Entrega sexta.  " } });
  fireEvent.click(screen.getByRole("button", { name: "Comentar" }));
  expect(actions.addComment).toHaveBeenCalledWith("t1", "Entrega sexta.");
  expect(items()).toHaveLength(3);
  expect(items()[2].textContent).toContain("Você");
  expect(screen.getByRole("heading", { name: "Comentários (3)" })).toBeTruthy();
  expect(field().value).toBe("");
  expect(document.activeElement).toBe(field());
  await settle(true);
});

test("Ctrl+Enter e Cmd+Enter publicam; Enter sozinho só quebra a linha", () => {
  setup();
  fireEvent.change(field(), { target: { value: "um" } });
  fireEvent.keyDown(field(), { key: "Enter" });
  expect(actions.addComment).not.toHaveBeenCalled();
  fireEvent.keyDown(field(), { key: "Enter", ctrlKey: true });
  expect(actions.addComment).toHaveBeenLastCalledWith("t1", "um");
  fireEvent.change(field(), { target: { value: "dois" } });
  fireEvent.keyDown(field(), { key: "Enter", metaKey: true });
  expect(actions.addComment).toHaveBeenLastCalledWith("t1", "dois");
});

test("campo vazio não publica e avisa", () => {
  setup();
  fireEvent.change(field(), { target: { value: "   " } });
  fireEvent.click(screen.getByRole("button", { name: "Comentar" }));
  expect(actions.addComment).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toBe(
    "Escreva o comentário antes de publicar.",
  );
});

test("se não gravar, o comentário some, o texto volta ao campo e avisa", async () => {
  setup();
  fireEvent.change(field(), { target: { value: "Entrega sexta." } });
  fireEvent.click(screen.getByRole("button", { name: "Comentar" }));
  await settle(false);
  expect(items()).toHaveLength(2);
  expect(field().value).toBe("Entrega sexta.");
  expect(screen.getByRole("alert").textContent).toBe(
    "Não foi possível salvar. Tente de novo.",
  );
});

test("só os próprios comentários têm Apagar, e ele pede confirmação", async () => {
  setup();
  const trash = screen.getAllByRole("button", { name: /^Apagar comentário/ });
  expect(trash).toHaveLength(1);
  expect(
    within(items()[1]).getByRole("button", { name: /^Apagar comentário/ }),
  ).toBe(trash[0]);

  fireEvent.click(trash[0]);
  expect(within(items()[1]).getByText("Apagar este comentário?")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(screen.queryByText("Apagar este comentário?")).toBeNull();
  expect(document.activeElement).toBe(trash[0]);

  fireEvent.click(trash[0]);
  fireEvent.click(screen.getByRole("button", { name: "Apagar" }));
  expect(actions.archiveComment).toHaveBeenCalledWith("c2");
  expect(items()).toHaveLength(1);
  expect(document.activeElement).toBe(field());
  await settle(true);
});

test("Esc fecha a confirmação sem fechar a janela em volta", () => {
  setup();
  const outer = vi.fn();
  document.addEventListener("keydown", outer);
  fireEvent.click(screen.getByRole("button", { name: /^Apagar comentário/ }));
  fireEvent.keyDown(screen.getByRole("button", { name: "Apagar" }), {
    key: "Escape",
  });
  expect(screen.queryByText("Apagar este comentário?")).toBeNull();
  expect(outer).not.toHaveBeenCalled();
  document.removeEventListener("keydown", outer);
});

test("Esc com o foco ainda na lixeira também fecha só a confirmação", () => {
  setup();
  const outer = vi.fn();
  document.addEventListener("keydown", outer);
  const trash = screen.getByRole("button", { name: /^Apagar comentário/ });
  fireEvent.click(trash);
  fireEvent.keyDown(trash, { key: "Escape" });
  expect(screen.queryByText("Apagar este comentário?")).toBeNull();
  expect(outer).not.toHaveBeenCalled();
  document.removeEventListener("keydown", outer);
});

test("se não apagar, o comentário volta e avisa", async () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: /^Apagar comentário/ }));
  fireEvent.click(screen.getByRole("button", { name: "Apagar" }));
  await settle(false);
  expect(items()).toHaveLength(2);
  expect(screen.getByRole("alert").textContent).toBe(
    "Não foi possível salvar. Tente de novo.",
  );
});

test("comentário recém-publicado não tem Apagar até ter id do banco", () => {
  setup([]);
  fireEvent.change(field(), { target: { value: "novo" } });
  fireEvent.click(screen.getByRole("button", { name: "Comentar" }));
  expect(
    screen.queryByRole("button", { name: /^Apagar comentário/ }),
  ).toBeNull();
});
