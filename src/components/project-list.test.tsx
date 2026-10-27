import { afterEach, describe, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { Project } from "@/lib/projects";

const actions = vi.hoisted(() => ({
  createProject: vi.fn(async () => ({ saved: true as const })),
  updateProject: vi.fn(async (): Promise<unknown> => ({
    errors: { name: "Dê um nome ao projeto." },
    values: { name: "", status: "idea", priority: "medium" },
  })),
  setArchived: vi.fn(async () => true),
}));
vi.mock("@/app/(app)/projetos/actions", () => actions);

const { ProjectList } = await import("./project-list");

const p = (over: Partial<Project>): Project => ({
  id: crypto.randomUUID(),
  name: "Projeto",
  description: null,
  status: "idea",
  priority: "medium",
  link: null,
  archived_at: null,
  ...over,
});
const projects = [
  p({
    name: "Site institucional",
    status: "in_progress",
    priority: "high",
    link: "https://siteexemplo.com.br/x",
  }),
  p({ name: "Aplicativo de pedidos", status: "in_progress" }),
  p({ name: "Painel financeiro", status: "idea", priority: "low" }),
  p({ name: "Migração de e-mails", status: "done" }),
  p({ name: "Loja antiga", archived_at: "2026-10-20T10:00:00Z" }),
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ativos", () => {
  test("agrupa por estado, na ordem Em andamento, Ideia, Pausado, Concluído, sem grupo vazio", () => {
    render(<ProjectList projects={projects} showArchived={false} />);
    const groups = screen.getAllByRole("heading", { level: 2 });
    expect(groups.map((h) => h.textContent)).toEqual([
      "Em andamento2",
      "Ideia1",
      "Concluído1",
    ]);
    expect(screen.queryByText("Loja antiga")).toBeNull();
  });

  test("abas mostram as contagens e a atual", () => {
    render(<ProjectList projects={projects} showArchived={false} />);
    const tabs = screen.getByRole("navigation", { name: "Filtro de projetos" });
    expect(
      within(tabs)
        .getByRole("link", { name: "Ativos (4)" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(
      within(tabs)
        .getByRole("link", { name: "Arquivados (1)" })
        .getAttribute("href"),
    ).toBe("/projetos?arquivados=1");
  });

  test("link externo abre com segurança e mostra só o endereço", () => {
    render(<ProjectList projects={projects} showArchived={false} />);
    const link = screen.getByRole("link", { name: /siteexemplo\.com\.br/ });
    expect(link.getAttribute("href")).toBe("https://siteexemplo.com.br/x");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.getAttribute("target")).toBe("_blank");
  });

  test("Editar troca a linha pelo formulário com os valores; Cancelar volta", () => {
    render(<ProjectList projects={projects} showArchived={false} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Editar Painel financeiro" }),
    );
    const form = screen.getByRole("form", { name: "Editar Painel financeiro" });
    expect(
      (within(form).getByLabelText("Nome") as HTMLInputElement).value,
    ).toBe("Painel financeiro");
    expect(
      (within(form).getByLabelText("Prioridade") as HTMLSelectElement).value,
    ).toBe("low");
    fireEvent.click(within(form).getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("form")).toBeNull();
  });

  test("erro do servidor aparece no campo, ligado a ele", async () => {
    render(<ProjectList projects={projects} showArchived={false} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Editar Painel financeiro" }),
    );
    const form = screen.getByRole("form", { name: "Editar Painel financeiro" });
    const save = within(form).getByRole("button", { name: "Salvar" });
    save.focus();
    fireEvent.click(save);
    const error = await within(form).findByText("Dê um nome ao projeto.");
    const name = within(form).getByLabelText("Nome");
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(name.getAttribute("aria-describedby")).toBe(error.id);
    expect(actions.updateProject).toHaveBeenCalledOnce();
    // o foco muda num efeito depois de o erro aparecer: espera, senão o teste corre contra ele
    await waitFor(() => expect(document.activeElement).toBe(name));
    expect(document.activeElement).toBe(name);
  });

  test("se arquivar falhar, avisa a falha em vez de sucesso", async () => {
    actions.setArchived.mockResolvedValueOnce(false as never);
    render(<ProjectList projects={projects} showArchived={false} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Editar Painel financeiro" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Arquivar" }));
    expect(
      await screen.findByText("Não foi possível arquivar. Tente de novo."),
    ).toBeDefined();
  });

  test("Novo projeto abre o formulário de criação; salvar fecha e avisa", async () => {
    render(<ProjectList projects={projects} showArchived={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Novo projeto" }));
    const form = screen.getByRole("form", { name: "Novo projeto" });
    fireEvent.change(within(form).getByLabelText("Nome"), {
      target: { value: "Novo" },
    });
    fireEvent.click(
      within(form).getByRole("button", { name: "Criar projeto" }),
    );
    expect(await screen.findByText("Projeto salvo.")).toBeDefined();
    expect(screen.queryByRole("form")).toBeNull();
    expect(actions.createProject).toHaveBeenCalledOnce();
  });

  test("sem projetos, diz como começar", () => {
    render(<ProjectList projects={[]} showArchived={false} />);
    expect(screen.getByText(/Nenhum projeto ainda/)).toBeDefined();
  });
});

describe("arquivados", () => {
  test("lista só os arquivados, cada um com Restaurar", () => {
    render(<ProjectList projects={projects} showArchived />);
    expect(screen.getByText("Loja antiga")).toBeDefined();
    expect(screen.queryByText("Site institucional")).toBeNull();
    const restore = screen.getByRole("button", {
      name: "Restaurar Loja antiga",
    });
    expect(restore.closest("form")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Novo projeto" })).toBeNull();
  });
});

// Proposta 7 do impeccable: a prioridade diz que é prioridade, à vista.
test("a linha mostra a prioridade com o rótulo à vista", () => {
  render(<ProjectList projects={projects} showArchived={false} />);
  const label = screen.getAllByText(
    (_, el) =>
      el?.className === "project-meta" && el.textContent === "Prioridade Média",
  )[0]!;
  expect(label.querySelector(".visually-hidden")).toBeNull();
});
