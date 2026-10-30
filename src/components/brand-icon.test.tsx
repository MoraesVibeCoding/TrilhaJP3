import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { BrandIcon } from "./brand-icon";

afterEach(cleanup);

const icon = (size?: number) => {
  const { container } = render(<BrandIcon size={size} />);
  return container.querySelector("svg")!;
};

test("it draws the M with five bars on a base line, the last bar being today's signal", () => {
  const svg = icon(32);
  expect(svg.querySelectorAll("[data-bar]")).toHaveLength(5);
  expect(svg.querySelectorAll("[data-pulse]")).toHaveLength(1);
  expect(svg.querySelectorAll("[data-bar]")[4].hasAttribute("data-pulse")).toBe(
    true,
  );
  expect(svg.querySelectorAll("[data-base]")).toHaveLength(1);
});

test("the minimum size is 24px", () => {
  expect(icon(16).getAttribute("width")).toBe("24");
});

test("it is decorative next to the name, so screen readers skip it", () => {
  expect(icon().getAttribute("aria-hidden")).toBe("true");
});
