import { Activity } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DemandDialog } from "./demand-dialog";

afterEach(cleanup);

const setup = (open = true) => {
  const onClose = vi.fn();
  render(
    <DemandDialog open={open} onClose={onClose} title="Revisar textos">
      <button>Dentro</button>
    </DemandDialog>,
  );
  return onClose;
};

test("is named by its title and shown when open", () => {
  setup();
  expect(screen.getByRole("dialog", { name: "Revisar textos" })).toBeDefined();
});

test("stays closed when open is false", () => {
  setup(false);
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("the close button asks to close", () => {
  const onClose = setup();
  fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("clicking the backdrop closes, clicking the content does not", () => {
  const onClose = setup();
  fireEvent.click(screen.getByRole("button", { name: "Dentro" }));
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("dialog"));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("Esc (the native close event) asks to close", () => {
  const onClose = setup();
  fireEvent(screen.getByRole("dialog"), new Event("close"));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("returns focus to the element that opened it", () => {
  const opener = document.createElement("button");
  document.body.append(opener);
  opener.focus();
  const { rerender } = render(
    <DemandDialog open onClose={() => {}} title="T">
      x
    </DemandDialog>,
  );
  rerender(
    <DemandDialog open={false} onClose={() => {}} title="T">
      x
    </DemandDialog>,
  );
  expect(document.activeElement).toBe(opener);
  opener.remove();
});

test("moves focus to the element marked as the initial focus", () => {
  render(
    <DemandDialog open onClose={() => {}} title="T">
      <button>Outro</button>
      <button data-autofocus>Primeiro foco</button>
    </DemandDialog>,
  );
  expect(document.activeElement?.textContent).toBe("Primeiro foco");
});

// Com cacheComponents o Next esconde a rota com <Activity> ao navegar; os efeitos limpam e rodam de novo ao voltar.
test("still returns focus to the original opener after the route was hidden and shown again", () => {
  const opener = document.createElement("button");
  document.body.append(opener);
  opener.focus();
  const tree = (mode: "visible" | "hidden", open: boolean) => (
    <Activity mode={mode}>
      <DemandDialog open={open} onClose={() => {}} title="T">
        x
      </DemandDialog>
    </Activity>
  );
  const { rerender } = render(tree("visible", true));
  rerender(tree("hidden", true));
  (document.activeElement as HTMLElement | null)?.blur(); // oculto, o foco se perde
  rerender(tree("visible", true));
  rerender(tree("visible", false));
  expect(document.activeElement).toBe(opener);
  opener.remove();
});

test("with a page address, offers Abrir em página inteira", () => {
  render(
    <DemandDialog
      open
      onClose={() => {}}
      title="Revisar textos"
      pageHref="/demandas/d1"
    >
      <p>corpo</p>
    </DemandDialog>,
  );
  expect(
    screen
      .getByRole("link", { name: "Abrir em página inteira" })
      .getAttribute("href"),
  ).toBe("/demandas/d1");
});

test("without a page address there is no full-page link", () => {
  setup();
  expect(screen.queryByRole("link")).toBeNull();
});
