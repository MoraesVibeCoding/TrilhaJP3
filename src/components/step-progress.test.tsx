import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { StepProgress } from "./step-progress";

afterEach(cleanup);

test("draws one mark per step and fills the finished ones", () => {
  const { container } = render(<StepProgress done={2} total={4} />);
  const marks = container.querySelectorAll("[data-filled]");
  expect([...marks].map((m) => m.getAttribute("data-filled"))).toEqual([
    "true",
    "true",
    "false",
    "false",
  ]);
});

test("is decorative: the text next to it carries the meaning", () => {
  const { container } = render(<StepProgress done={1} total={3} />);
  expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
});

test("draws nothing when there are no steps", () => {
  const { container } = render(<StepProgress done={0} total={0} />);
  expect(container.textContent).toBe("");
  expect(container.querySelectorAll("[data-filled]")).toHaveLength(0);
});
