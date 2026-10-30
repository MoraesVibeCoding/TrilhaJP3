import { afterEach, expect, test } from "vitest";
import type { ReactElement } from "react";
import {
  cleanup,
  render as rtlRender,
  screen,
  within,
} from "@testing-library/react";
import { afterAll, beforeAll, vi } from "vitest";
import { demoDemands, demoNow, demoProjects } from "@/test/demo-data";

// A leitura do banco é simulada com os dados de exemplo, e o relógio fica no dia deles.
vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("@/lib/demands", () => ({ listDemands: async () => demoDemands }));
vi.mock("@/lib/projects", () => ({ listProjects: async () => demoProjects }));
beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(demoNow);
});
afterAll(() => vi.useRealTimers());

const { default: Page } = await import("./page");

afterEach(cleanup);

// O componente assíncrono atrás do <Suspense> é chamado direto (o React do teste não o renderiza).
async function render(page: ReactElement) {
  const suspense = (
    page.type as () => ReactElement<{ children: ReactElement }>
  )();
  const inner = suspense.props.children;
  rtlRender(await (inner.type as () => Promise<ReactElement>)());
}

test("home is Retomar", async () => {
  await render(<Page />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Retomar" }),
  ).toBeDefined();
});

test("offers a shortcut to all demands", async () => {
  await render(<Page />);
  expect(
    screen
      .getByRole("link", { name: "Todas as demandas" })
      .getAttribute("href"),
  ).toBe("/demandas");
});

test("leads with Agora, then the rest in progress, then Feito hoje", async () => {
  await render(<Page />);
  const nowSection = screen.getByRole("region", { name: "Agora" });
  expect(
    within(nowSection).getByText("Revisar textos da página inicial"),
  ).toBeDefined();
  const rows = within(
    screen.getByRole("list", { name: "Em andamento" }),
  ).getAllByRole("listitem");
  expect(rows).toHaveLength(
    demoDemands.filter((d) => d.state === "Fazendo").length - 1,
  );
  expect(
    screen.getByText(
      (_, el) =>
        el?.tagName === "SUMMARY" && el.textContent === "Feito hoje (2)",
    ),
  ).toBeDefined();
});
