import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/app/entrar/actions", () => ({ signOut: vi.fn() }));

const { default: AppLayout } = await import("./layout");

afterEach(cleanup);

test("as páginas do app ficam dentro da casca", () => {
  render(
    <AppLayout params={Promise.resolve({})}>
      <h1>Retomar</h1>
    </AppLayout>,
  );
  expect(screen.getByRole("main").querySelector("h1")?.textContent).toBe(
    "Retomar",
  );
  expect(screen.getByRole("navigation", { name: "Principal" })).toBeDefined();
});
