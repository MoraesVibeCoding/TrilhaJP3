import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Icon } from "./icon";

afterEach(cleanup);

// Ícones de interface do design system Moraes Coding: grade 24, traço de 2px, pontas retas, cantos vivos.
test("draws in the design system stroke and takes the text color", () => {
  const { container } = render(<Icon name="menu" />);
  const svg = container.querySelector("svg")!;
  expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
  expect(svg.getAttribute("stroke")).toBe("currentColor");
  expect(svg.getAttribute("stroke-width")).toBe("2");
  expect(svg.getAttribute("stroke-linecap")).toBe("square");
  expect(svg.getAttribute("stroke-linejoin")).toBe("miter");
  expect(svg.getAttribute("aria-hidden")).toBe("true");
  expect(svg.getAttribute("width")).toBe("20");
});

test("takes the size it is given", () => {
  const { container } = render(<Icon name="adicionar" size={18} />);
  expect(container.querySelector("svg")!.getAttribute("width")).toBe("18");
});
