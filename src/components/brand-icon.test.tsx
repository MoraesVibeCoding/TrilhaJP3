import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { BrandIcon } from "./brand-icon";

afterEach(cleanup);

const icon = (size?: number) => {
  const { container } = render(<BrandIcon size={size} />);
  return container.querySelector("svg")!;
};

test("at 32px or more it shows the two terminals and the lime pulse", () => {
  const svg = icon(32);
  expect(svg.querySelectorAll("[data-terminal]")).toHaveLength(2);
  expect(svg.querySelectorAll("[data-pulse]")).toHaveLength(1);
});

test("below 32px it loses the terminals and thickens the stroke", () => {
  const svg = icon(28);
  expect(svg.querySelectorAll("[data-terminal]")).toHaveLength(0);
  expect(svg.querySelector("[data-pulse]")).not.toBeNull();
  expect(svg.querySelector("path")!.getAttribute("stroke-width")).toBe("9");
});

test("the minimum size is 24px", () => {
  expect(icon(16).getAttribute("width")).toBe("24");
});

test("it is decorative next to the name, so screen readers skip it", () => {
  expect(icon().getAttribute("aria-hidden")).toBe("true");
});
