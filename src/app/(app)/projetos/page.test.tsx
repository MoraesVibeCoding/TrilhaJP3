import { afterEach, expect, test, vi } from "vitest";
import type { ReactElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("@/lib/projects", () => ({
  listProjects: async () => [
    {
      id: "1",
      name: "Site institucional",
      description: null,
      status: "idea",
      priority: "medium",
      link: null,
      archived_at: null,
    },
  ],
}));
vi.mock("./actions", () => ({
  createProject: vi.fn(),
  updateProject: vi.fn(),
  setArchived: vi.fn(),
}));

const { default: Page, metadata } = await import("./page");

afterEach(cleanup);

// O componente assíncrono atrás do <Suspense> é chamado direto (o React do teste não o renderiza).
async function renderPage(search: Record<string, string>) {
  const suspense = Page({
    params: Promise.resolve({}),
    searchParams: Promise.resolve(search),
  }) as ReactElement<{ children: ReactElement }>;
  const inner = suspense.props.children;
  const load = inner.type as (p: typeof inner.props) => Promise<ReactElement>;
  render(await load(inner.props));
}

test("mostra os projetos da empresa; ?arquivados=1 troca para os arquivados", async () => {
  await renderPage({});
  expect(screen.getByText("Site institucional")).toBeDefined();
  expect(metadata.title).toBe("Projetos · Trilha JP3");
  cleanup();
  await renderPage({ arquivados: "1" });
  expect(screen.getByText("Nenhum projeto arquivado.")).toBeDefined();
});
