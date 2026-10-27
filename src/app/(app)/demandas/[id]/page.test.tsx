import { afterEach, expect, test } from "vitest";
import { isValidElement, type ReactElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, vi } from "vitest";
import { demoDemands, demoNow, demoProjects } from "@/lib/demo-data";

// A leitura do banco é simulada com os dados de exemplo, e o relógio fica no dia deles.
vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("@/lib/demands", () => ({ listDemands: async () => demoDemands }));
vi.mock("@/lib/projects", () => ({ listProjects: async () => demoProjects }));
beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(demoNow);
});
afterAll(() => vi.useRealTimers());

const { default: Page, generateMetadata } = await import("./page");

afterEach(cleanup);

const params = (id: string) => Promise.resolve({ id });

test("the tab title names the demand; an unknown id gets a neutral title", async () => {
  expect(
    (await generateMetadata({ params: params("d1") } as never)).title,
  ).toBe("Revisar textos da página inicial · TrilhaJp3");
  expect((await generateMetadata({ params: params("x") } as never)).title).toBe(
    "Demanda · TrilhaJp3",
  );
});

test("the page reads params inside Suspense and renders the demand", async () => {
  const suspense = Page({ params: params("d1") } as never) as ReactElement<{
    children: ReactElement<{ params: Promise<{ id: string }> }>;
  }>;
  const demand = suspense.props.children;
  expect(isValidElement(demand)).toBe(true);
  const load = demand.type as (p: typeof demand.props) => Promise<ReactElement>;
  render(await load(demand.props));
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "Revisar textos da página inicial",
    }),
  ).toBeDefined();
});
