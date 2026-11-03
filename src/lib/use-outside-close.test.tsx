import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { closeOnBlur, useOutsideClose } from "./use-outside-close";

afterEach(cleanup);

function Box({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, onClose);
  return (
    <>
      <div ref={ref} onBlur={(e) => closeOnBlur(e, onClose)}>
        <button type="button">dentro</button>
        <button type="button">outro de dentro</button>
      </div>
      <button type="button">fora</button>
    </>
  );
}

test("a press outside closes; a press inside does not", () => {
  const onClose = vi.fn();
  render(<Box open onClose={onClose} />);
  fireEvent.pointerDown(screen.getByText("dentro"));
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.pointerDown(screen.getByText("fora"));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("closed, it does not listen", () => {
  const onClose = vi.fn();
  render(<Box open={false} onClose={onClose} />);
  fireEvent.pointerDown(screen.getByText("fora"));
  expect(onClose).not.toHaveBeenCalled();
});

// Safari não dá foco ao botão clicado: o blur chega sem destino e não pode fechar o painel.
test("focus leaving with no destination (Safari's click) does not close; Tab to outside does", () => {
  const onClose = vi.fn();
  render(<Box open onClose={onClose} />);
  fireEvent.blur(screen.getByText("dentro"), { relatedTarget: null });
  fireEvent.blur(screen.getByText("dentro"), {
    relatedTarget: screen.getByText("outro de dentro"),
  });
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.blur(screen.getByText("dentro"), {
    relatedTarget: screen.getByText("fora"),
  });
  expect(onClose).toHaveBeenCalledTimes(1);
});
