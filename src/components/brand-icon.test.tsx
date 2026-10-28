import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { BrandIcon } from "./brand-icon";

afterEach(cleanup);

const icon = (size?: number) => {
  const { container } = render(<BrandIcon size={size} />);
  return container.querySelector("svg")!;
};

// Logo Moraes Coding: o M de cinco barras sobre a linha de base; a última barra é "o número de hoje".
test("draws the M of five bars on a baseline, with today's bar last", () => {
  const svg = icon(32);
  const bars = svg.querySelectorAll("rect[data-bar]");
  expect(bars).toHaveLength(5);
  expect(bars[4]!.getAttribute("data-bar")).toBe("hoje");
  expect(svg.querySelectorAll("rect[data-base]")).toHaveLength(1);
});

test("the minimum size is 24px", () => {
  expect(icon(16).getAttribute("width")).toBe("24");
});

test("it is decorative next to the name, so screen readers skip it", () => {
  expect(icon().getAttribute("aria-hidden")).toBe("true");
});
