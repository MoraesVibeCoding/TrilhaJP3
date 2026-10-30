import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Icon } from "./icon";

afterEach(cleanup);

const svg = (ui: React.ReactElement) =>
  render(ui).container.querySelector("svg")!;

test("draws the brand stroke: 24 grid, 2px, square caps, sharp corners", () => {
  const el = svg(<Icon name="menu" />);
  expect(el.getAttribute("viewBox")).toBe("0 0 24 24");
  expect(el.getAttribute("stroke")).toBe("currentColor");
  expect(el.getAttribute("stroke-width")).toBe("2");
  expect(el.getAttribute("stroke-linecap")).toBe("square");
  expect(el.getAttribute("stroke-linejoin")).toBe("miter");
  expect(el.querySelector("path")!.getAttribute("d")).toBe(
    "M4 6H20M4 12H20M4 18H20",
  );
});

test("is decorative by default and takes the size asked", () => {
  const el = svg(<Icon name="fechar" size={16} />);
  expect(el.getAttribute("aria-hidden")).toBe("true");
  expect(el.getAttribute("width")).toBe("16");
  expect(el.getAttribute("height")).toBe("16");
});
