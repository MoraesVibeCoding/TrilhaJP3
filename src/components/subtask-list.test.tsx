import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SubtaskList } from "./demand-detail";

afterEach(cleanup);

const subs = [
  { id: "s1", title: "Home", done: true },
  { id: "s2", title: "Contato", done: false },
];

// T7, proposta C: caixa e título na linha, "Mais opções" com Renomear e Remover, e "Adicionar subtarefa".
function setup() {
  const editor = {
    add: vi.fn(),
    rename: vi.fn(),
    toggle: vi.fn(),
    remove: vi.fn(),
  };
  render(<SubtaskList subtasks={subs} editor={editor} />);
  return editor;
}

test("without an editor the list only shows the steps", () => {
  render(<SubtaskList subtasks={subs} />);
  expect(screen.queryByRole("checkbox")).toBeNull();
  expect(screen.queryByRole("button")).toBeNull();
});

test("each step has a named checkbox that marks it done or not", () => {
  const editor = setup();
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Marcar Contato como feita" }),
  );
  expect(editor.toggle).toHaveBeenCalledWith("s2", true);
  const home = screen.getByRole("checkbox", {
    name: "Marcar Home como não feita",
  });
  expect((home as HTMLInputElement).checked).toBe(true);
  fireEvent.click(home);
  expect(editor.toggle).toHaveBeenCalledWith("s1", false);
});

test("Mais opções opens Renomear and Remover for that step only", () => {
  const editor = setup();
  const more = screen.getByRole("button", { name: "Mais opções para Contato" });
  expect(more.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("button", { name: "Remover" })).toBeNull();
  fireEvent.click(more);
  expect(more.getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Remover" }));
  expect(editor.remove).toHaveBeenCalledWith("s2");
});

test("Renomear turns the title into a field: Enter saves, Esc cancels and returns focus", () => {
  const editor = setup();
  const more = () =>
    screen.getByRole("button", { name: "Mais opções para Contato" });
  fireEvent.click(more());
  fireEvent.click(screen.getByRole("button", { name: "Renomear" }));
  const field = screen.getByRole("textbox", { name: "Novo título de Contato" });
  expect(document.activeElement).toBe(field);
  fireEvent.change(field, { target: { value: "  Contato   e mapa " } });
  fireEvent.keyDown(field, { key: "Enter" });
  expect(editor.rename).toHaveBeenCalledWith("s2", "Contato e mapa");
  expect(
    screen.queryByRole("textbox", { name: "Novo título de Contato" }),
  ).toBeNull();

  fireEvent.click(more());
  fireEvent.click(screen.getByRole("button", { name: "Renomear" }));
  fireEvent.keyDown(
    screen.getByRole("textbox", { name: "Novo título de Contato" }),
    { key: "Escape" },
  );
  expect(editor.rename).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(more());
});

test("an empty or unchanged title saves nothing; empty says why", () => {
  const editor = setup();
  fireEvent.click(
    screen.getByRole("button", { name: "Mais opções para Contato" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Renomear" }));
  const field = screen.getByRole("textbox", { name: "Novo título de Contato" });
  fireEvent.change(field, { target: { value: "   " } });
  fireEvent.keyDown(field, { key: "Enter" });
  expect(screen.getByRole("alert").textContent).toBe(
    "Escreva o título da subtarefa.",
  );
  fireEvent.change(field, { target: { value: "Contato" } });
  fireEvent.keyDown(field, { key: "Enter" });
  expect(editor.rename).not.toHaveBeenCalled();
});

test("Adicionar subtarefa opens a field that adds at the end and stays open", () => {
  const editor = setup();
  fireEvent.click(screen.getByRole("button", { name: "Adicionar subtarefa" }));
  const field = screen.getByRole("textbox", { name: "Nova subtarefa" });
  expect(document.activeElement).toBe(field);
  fireEvent.change(field, { target: { value: "Rodapé" } });
  fireEvent.submit(field.closest("form")!);
  expect(editor.add).toHaveBeenCalledWith("Rodapé");
  expect((field as HTMLInputElement).value).toBe("");
  fireEvent.submit(field.closest("form")!);
  expect(editor.add).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("alert").textContent).toBe(
    "Escreva o título da subtarefa.",
  );
  fireEvent.keyDown(field, { key: "Escape" });
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Adicionar subtarefa" }),
  );
});

test("with no steps yet, the editor still offers Adicionar subtarefa", () => {
  render(
    <SubtaskList
      subtasks={[]}
      editor={{
        add: vi.fn(),
        rename: vi.fn(),
        toggle: vi.fn(),
        remove: vi.fn(),
      }}
    />,
  );
  expect(screen.getByText("Nenhuma subtarefa.")).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Adicionar subtarefa" }),
  ).toBeDefined();
});

test("Esc closes the options and returns focus, without reaching the window", () => {
  setup();
  const more = screen.getByRole("button", { name: "Mais opções para Contato" });
  fireEvent.click(more);
  // fireEvent devolve false quando o evento foi cancelado: o Esc não segue para a janela.
  const reachedWindow = fireEvent.keyDown(
    screen.getByRole("button", { name: "Remover" }),
    { key: "Escape" },
  );
  expect(reachedWindow).toBe(false);
  expect(screen.queryByRole("button", { name: "Remover" })).toBeNull();
  expect(document.activeElement).toBe(more);
});

test("focus leaving the options closes them", () => {
  setup();
  fireEvent.click(
    screen.getByRole("button", { name: "Mais opções para Contato" }),
  );
  fireEvent.blur(screen.getByRole("button", { name: "Remover" }), {
    relatedTarget: screen.getByRole("button", { name: "Adicionar subtarefa" }),
  });
  expect(screen.queryByRole("button", { name: "Remover" })).toBeNull();
});

test("a done step is told by its checkbox, not by a 'feito' suffix", () => {
  setup();
  expect(screen.queryByText("feito", { exact: false })).toBeNull();
});

test("removing a step while the add field is open keeps focus in the field", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Adicionar subtarefa" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Mais opções para Contato" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Remover" }));
  expect(document.activeElement).toBe(
    screen.getByRole("textbox", { name: "Nova subtarefa" }),
  );
});
