// Dados fictícios dos testes: a semente do E2E (e2e/seed.ts) e os testes das páginas. O app não os lê.
import type { Demand } from "@/lib/demand-labels";

type ProjectStatus = "Ideia" | "Em andamento" | "Pausado" | "Concluído";

export const demoProjects = [
  { id: "p1", name: "Site institucional", status: "Em andamento" },
  { id: "p2", name: "Aplicativo de pedidos", status: "Em andamento" },
  { id: "p3", name: "Painel financeiro", status: "Ideia" },
  { id: "p4", name: "Migração de e-mails", status: "Concluído" },
] as const satisfies readonly {
  id: string;
  name: string;
  status: ProjectStatus;
}[];

// Referência fixa para os testes: "hoje" não pode depender do relógio de quem roda.
export const demoNow = new Date(2026, 9, 22, 15, 0);

type Lists = "comments" | "attachments" | "history";
const raw: readonly (Omit<Demand, Lists> & Partial<Pick<Demand, Lists>>)[] = [
  {
    id: "d1",
    isNow: true,
    comments: [
      {
        author: "Pedro",
        at: "ontem, 17h",
        text: "Falta revisar o texto de contato.",
      },
    ],
    attachments: [{ name: "textos-v2.pdf" }],
    history: [
      { at: "ontem, 17h", text: "Estado mudou para Fazendo" },
      { at: "20 de out.", text: "Demanda criada" },
    ],
    lastActivityAt: "2026-10-21T17:00:00",
    subtasks: [
      { title: "Home", done: true },
      { title: "Contato", done: false },
      { title: "Rodapé", done: false },
    ],
    projectId: "p1",
    title: "Revisar textos da página inicial",
    state: "Fazendo",
    priority: "Alta",
  },
  {
    id: "d2",
    lastActivityAt: "2026-10-20T11:00:00",
    subtasks: [],
    projectId: "p1",
    title: "Publicar formulário de contato",
    state: "A fazer",
    priority: "Média",
  },
  {
    id: "d3",
    comments: [
      {
        author: "Pedro",
        at: "segunda, 10h",
        text: "Definir antes o meio de pagamento.",
      },
    ],
    lastActivityAt: "2026-10-19T10:00:00",
    subtasks: [
      { title: "Fluxo do carrinho", done: true },
      { title: "Pagamento", done: false },
    ],
    projectId: "p2",
    title: "Definir fluxo de checkout",
    state: "Fazendo",
    priority: "Alta",
  },
  {
    id: "d4",
    lastActivityAt: "2026-10-18T09:00:00",
    subtasks: [],
    projectId: "p2",
    title: "Escolher meio de pagamento",
    state: "A fazer",
    priority: "Alta",
  },
  {
    id: "d5",
    lastActivityAt: "2026-10-15T16:00:00",
    subtasks: [],
    projectId: "p3",
    title: "Listar relatórios necessários",
    state: "A fazer",
    priority: "Baixa",
  },
  {
    id: "d6",
    doneAt: "2026-10-14T12:00:00",
    lastActivityAt: "2026-10-14T12:00:00",
    subtasks: [],
    projectId: "p4",
    title: "Confirmar caixas postais migradas",
    state: "Feito",
    priority: "Média",
  },
  {
    id: "d8",
    projectId: "p2",
    title: "Enviar proposta ao cliente",
    state: "Feito",
    priority: "Alta",
    lastActivityAt: "2026-10-22T11:00:00",
    doneAt: "2026-10-22T11:00:00",
    subtasks: [],
  },
  {
    id: "d9",
    projectId: "p1",
    title: "Ajustar rodapé do site",
    state: "Feito",
    priority: "Baixa",
    lastActivityAt: "2026-10-22T13:30:00",
    doneAt: "2026-10-22T13:30:00",
    subtasks: [],
  },
  {
    id: "d7",
    lastActivityAt: "2026-10-22T09:00:00",
    subtasks: [],
    projectId: "p1",
    title: "Fotos da equipe",
    state: "Fazendo",
    priority: "Média",
  },
];

// Sem comentário, anexo ou histórico, a lista vem vazia: as telas não precisam completar cada demanda.
export const demoDemands: readonly Demand[] = raw.map((d) => ({
  comments: [],
  attachments: [],
  history: [],
  ...d,
}));
