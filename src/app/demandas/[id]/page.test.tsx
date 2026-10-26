import { afterEach, expect, test } from "vitest";
import { isValidElement, type ReactElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Page, { generateMetadata, generateStaticParams } from "./page";
import { demoDemands } from "@/lib/demo-data";

afterEach(cleanup);

const params = (id: string) => Promise.resolve({ id });

test("every demo demand is prerendered", () => {
  expect(generateStaticParams()).toEqual(
    demoDemands.map((d) => ({ id: d.id })),
  );
});

test("the tab title names the demand; an unknown id gets a neutral title", async () => {
  expect(
    (await generateMetadata({ params: params("d1") } as never)).title,
  ).toBe("Revisar textos da página inicial · TrilhaJp3");
  expect((await generateMetadata({ params: params("x") } as never)).title).toBe(
    "Demanda · TrilhaJp3",
  );
});

test("the page reads params inside Suspense and renders the demand", async () => {
  const tree = Page({ params: params("d1") } as never) as ReactElement<{
    children: ReactElement[];
  }>;
  const suspense = tree.props.children[0] as ReactElement<{
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
