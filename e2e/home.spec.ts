import { actionSaved, resetDemo } from "./seed";
import { expect, test } from "@playwright/test";

// Testes marcados com @grava mudam o banco: no fim, as demandas voltam ao estado inicial.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.tags.includes("@grava")) await resetDemo();
});

test("home page loads with the app name and pt-BR language", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Trilha JP3");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Retomar");
});

test("theme toggle switches to dark and survives reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ativar modo escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("mobile menu opens the navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Retomar" })).toBeHidden();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.getByRole("link", { name: "Retomar" })).toBeVisible();
});

test("page never scrolls horizontally on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("Todas as demandas leads to the Demandas page and marks it current", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Todas as demandas" }).click();
  await expect(page).toHaveURL(/\/demandas$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Demandas");
  await expect(
    page.getByRole("navigation", { name: "Principal" }).getByRole("link", {
      name: "Demandas",
    }),
  ).toHaveAttribute("aria-current", "page");
});

test.describe("janela da demanda", () => {
  const opener = (page: import("@playwright/test").Page) =>
    page.getByRole("button", { name: "Revisar textos da página inicial" });

  test("opens from Retomar and shows the next step first", async ({ page }) => {
    await page.goto("/");
    await opener(page).click();
    const dialog = page.getByRole("dialog", {
      name: "Revisar textos da página inicial",
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("region", { name: "Agora" })).toContainText(
      "Contato",
    );
  });

  test("Esc closes it and focus returns to the row", async ({ page }) => {
    await page.goto("/");
    await opener(page).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(opener(page)).toBeFocused();
  });

  test("is centered on the page", async ({ page }) => {
    await page.goto("/");
    await opener(page).click();
    const box = await page.getByRole("dialog").boundingBox();
    const vp = page.viewportSize()!;
    expect(Math.abs(box!.x + box!.width / 2 - vp.width / 2)).toBeLessThan(2);
    expect(box!.y).toBeGreaterThan(0);
  });

  test("clicking outside closes it", async ({ page }) => {
    await page.goto("/");
    await opener(page).click();
    await page.mouse.click(5, 5);
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(opener(page)).toBeFocused();
  });

  test("keeps keyboard focus inside while open", async ({ page }) => {
    await page.goto("/");
    await opener(page).click();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      // Tab pode sair para a interface do navegador (body); nunca para a página atrás
      const inside = await page.evaluate(
        () =>
          document.activeElement === document.body ||
          document
            .querySelector("dialog[open]")!
            .contains(document.activeElement),
      );
      expect(inside).toBe(true);
    }
  });

  test(
    "Concluir passo advances to the next step",
    { tag: "@grava" },
    async ({ page }) => {
      await page.goto("/");
      await opener(page).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("button", { name: "Concluir passo" }).click();
      await expect(dialog.getByRole("region", { name: "Agora" })).toContainText(
        "Rodapé",
      );
    },
  );

  test("fills the phone screen without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    await opener(page).click();
    // a entrada da janela escala por 180 ms; mede depois dela
    await page
      .getByRole("dialog")
      .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    const box = await page.getByRole("dialog").boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(389);
    expect(box!.height).toBeGreaterThanOrEqual(799);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test("the page link is a 44px touch target", async ({ page }) => {
  await page.goto("/");
  const box = await page
    .getByRole("link", { name: "Todas as demandas" })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
});

test("saved mode and theme are applied before the first paint", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("trilhajp3-mode", "focus");
    localStorage.setItem("trilhajp3-theme", "dark");
  });
  await page.goto("/", { waitUntil: "commit" });
  // o script do <head> roda durante o parse; ao fim dele os atributos já valem
  await page.waitForFunction(() => document.readyState !== "loading");
  const attrs = await page.evaluate(
    () =>
      document.documentElement.dataset.mode +
      "," +
      document.documentElement.dataset.theme,
  );
  expect(attrs).toBe("focus,dark");
});

const enterFocus = (page: import("@playwright/test").Page) =>
  expect(async () => {
    if ((await page.locator("html").getAttribute("data-mode")) !== "focus")
      await page.keyboard.press("f");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "focus", {
      timeout: 500,
    });
  }).toPass();

test.describe("modo Foco", () => {
  const nav = (page: import("@playwright/test").Page) =>
    page.getByRole("navigation", { name: "Principal" });
  const rows = (page: import("@playwright/test").Page) =>
    page.getByRole("list", { name: "Em andamento" }).getByRole("listitem");

  test("Completo shows the sidebar and every demand in progress", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(nav(page)).toBeVisible();
    await expect(rows(page)).toHaveCount(2);
  });

  test("clicking the toggle collapses to the essentials", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ativar modo foco" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "focus");
    await expect(nav(page)).toBeHidden();
    await expect(rows(page)).toHaveCount(0);
    await expect(page.getByRole("status")).toHaveText("Modo foco ativado");
  });

  test("the F key toggles and the choice survives a reload", async ({
    page,
  }) => {
    await page.goto("/");
    await enterFocus(page);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "focus");
    await expect(rows(page)).toHaveCount(0);
    await expect(async () => {
      if ((await page.locator("html").getAttribute("data-mode")) !== "full")
        await page.keyboard.press("f");
      await expect(rows(page)).toHaveCount(2, { timeout: 500 });
    }).toPass();
  });

  test("the window keeps only the next step and Subtarefas", async ({
    page,
  }) => {
    await page.goto("/");
    await enterFocus(page);
    await page
      .getByRole("button", { name: "Revisar textos da página inicial" })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("region", { name: "Agora" })).toBeVisible();
    await expect(dialog.getByText("Subtarefas (3)")).toBeVisible();
    await expect(dialog.getByText("Comentários (1)")).toBeHidden();
    await expect(dialog.getByText("Histórico (2)")).toBeHidden();
  });

  test("on a phone the toggle still fits in the header", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Ativar modo foco" }),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Retomar: Agora e Feito hoje", () => {
  test("leads with Agora and the next step; the rest comes after", async ({
    page,
  }) => {
    await page.goto("/");
    const agora = page.getByRole("region", { name: "Agora", exact: true });
    await expect(agora).toContainText("Revisar textos da página inicial");
    await expect(agora).toContainText("Passo 2 de 3");
    await expect(
      page.getByRole("heading", { name: "Em andamento (2)" }),
    ).toBeVisible();
  });

  test(
    "Concluir passo on the block advances it and the window agrees",
    { tag: "@grava" },
    async ({ page }) => {
      await page.goto("/");
      const agora = page.getByRole("region", { name: "Agora", exact: true });
      await agora.getByRole("button", { name: "Concluir passo" }).click();
      await expect(agora).toContainText("Rodapé");
      await agora
        .getByRole("button", { name: "Revisar textos da página inicial" })
        .click();
      await expect(
        page.getByRole("dialog").getByRole("region", { name: "Agora" }),
      ).toContainText("Rodapé");
    },
  );

  test("Feito hoje is collapsed and lists today's finished demands", async ({
    page,
  }) => {
    await page.goto("/");
    const summary = page.getByText("Feito hoje (2)");
    await expect(summary).toBeVisible();
    await expect(page.getByText("Enviar proposta ao cliente")).toBeHidden();
    await summary.click();
    await expect(page.getByText("Enviar proposta ao cliente")).toBeVisible();
  });

  test(
    "marking another demand as Agora swaps the blocks",
    { tag: "@grava" },
    async ({ page }) => {
      await page.goto("/");
      await page
        .getByRole("button", { name: "Definir fluxo de checkout" })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Marcar como Agora" })
        .click();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("region", { name: "Agora", exact: true }),
      ).toContainText("Definir fluxo de checkout");
    },
  );

  test("Foco shows only the Agora block", async ({ page }) => {
    await page.goto("/");
    await enterFocus(page);
    await expect(
      page.getByRole("region", { name: "Agora", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Feito hoje (2)")).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "Em andamento (2)" }),
    ).toBeHidden();
  });
});

test.describe("correções da revisão final", () => {
  test("the window opens with focus on Concluir passo", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Revisar textos da página inicial" })
      .click();
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "Concluir passo" }),
    ).toBeFocused();
  });

  test("the frosted backdrop is green, never gray", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Revisar textos da página inicial" })
      .click();
    const rgb = await page.evaluate(() => {
      const c = getComputedStyle(
        document.querySelector("dialog")!,
        "::backdrop",
      ).backgroundColor;
      return c
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number);
    });
    expect(rgb[1]).toBeGreaterThan(rgb[0] + 20);
    expect(rgb[1]).toBeGreaterThan(rgb[2] + 15);
  });

  test("the Agora button says so in words and is hidden in Foco", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Revisar textos da página inicial" })
      .click();
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "Tirar de Agora" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await enterFocus(page);
    await page
      .getByRole("button", { name: "Revisar textos da página inicial" })
      .click();
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "Tirar de Agora" }),
    ).toBeHidden();
  });

  test("Projetos is a link in the sidebar (T4)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Projetos" })).toBeVisible();
  });
});

test.describe("página Demandas (T6a)", () => {
  const table = (page: import("@playwright/test").Page) =>
    page.getByRole("table", { name: "Demandas" });
  const bodyRows = (page: import("@playwright/test").Page) =>
    table(page).locator("tbody tr");

  test("desktop shows the table with every demand, ordered by priority", async ({
    page,
  }) => {
    await page.goto("/demandas");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Demandas",
    );
    await expect(table(page)).toBeVisible();
    await expect(bodyRows(page)).toHaveCount(9);
    await expect(
      table(page).getByRole("columnheader", { name: /Prioridade/ }),
    ).toHaveAttribute("aria-sort", "descending");
    await expect(
      page.getByRole("list", { name: "Demandas em cartões" }),
    ).toBeHidden();
  });

  test("filtering by state narrows the table and the choice survives a reload", async ({
    page,
  }) => {
    await page.goto("/demandas");
    await page.getByRole("button", { name: /Feito/ }).click();
    await expect(bodyRows(page)).toHaveCount(3);
    await expect(page.getByText("Mostrando 3 de 9")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: /Feito/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(bodyRows(page)).toHaveCount(3);
    await page.getByRole("button", { name: "Limpar filtros" }).click();
    await expect(bodyRows(page)).toHaveCount(9);
  });

  test("clicking a header sorts and announces it", async ({ page }) => {
    await page.goto("/demandas");
    await table(page).getByRole("button", { name: "Demanda" }).click();
    await expect(
      table(page).getByRole("columnheader", { name: /Demanda/ }),
    ).toHaveAttribute("aria-sort", "ascending");
    await expect(bodyRows(page).first()).toContainText(
      "Ajustar rodapé do site",
    );
  });

  test("a row opens the window and focus returns to it", async ({ page }) => {
    await page.goto("/demandas");
    const opener = table(page).getByRole("button", {
      name: "Definir fluxo de checkout",
    });
    await opener.click();
    await expect(
      page.getByRole("dialog", { name: "Definir fluxo de checkout" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
  });

  for (const [name, w, h] of [
    ["iPad em retrato", 820, 1180],
    ["celular", 390, 844],
  ] as const) {
    test(`${name}: cards replace the table, with no horizontal scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/demandas");
      await expect(page.getByRole("table", { name: "Demandas" })).toBeHidden();
      const cards = page.getByRole("list", { name: "Demandas em cartões" });
      await expect(cards).toBeVisible();
      await expect(cards.getByRole("listitem")).toHaveCount(9);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("iPad em paisagem keeps the table", async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto("/demandas");
    await expect(table(page)).toBeVisible();
  });

  test("Foco keeps 5 rows and says what it hides", async ({ page }) => {
    await page.goto("/demandas");
    await enterFocus(page);
    await expect(bodyRows(page).locator("visible=true")).toHaveCount(5);
    await expect(page.getByText(/Mostrando as 5 primeiras de 9/)).toBeVisible();
  });

  test("tampered storage does not break the page", async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        "trilhajp3-demandas",
        JSON.stringify({ state: "<img src=x>", sortKey: "hack" }),
      ),
    );
    await page.goto("/demandas");
    await expect(bodyRows(page)).toHaveCount(9);
  });
});

test.describe("revisão final da T6a", () => {
  const table = (page: import("@playwright/test").Page) =>
    page.getByRole("table", { name: "Demandas" });

  test("the first row is work to do, never a finished demand", async ({
    page,
  }) => {
    await page.goto("/demandas");
    await expect(table(page).locator("tbody tr").first()).not.toContainText(
      "Feito",
    );
  });

  test("clicking anywhere on a row opens its window", async ({ page }) => {
    await page.goto("/demandas");
    const row = table(page).locator("tbody tr").filter({
      hasText: "Definir fluxo de checkout",
    });
    const box = (await row.locator("td").nth(1).boundingBox())!;
    await page.mouse.click(box.x + 10, box.y + box.height / 2);
    await expect(
      page.getByRole("dialog", { name: "Definir fluxo de checkout" }),
    ).toBeVisible();
  });

  test("clicking anywhere on a card opens its window", async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto("/demandas");
    await page
      .getByRole("list", { name: "Demandas em cartões" })
      .getByRole("listitem")
      .filter({ hasText: "Definir fluxo de checkout" })
      .getByText("Aplicativo de pedidos")
      .click({ force: true });
    await expect(
      page.getByRole("dialog", { name: "Definir fluxo de checkout" }),
    ).toBeVisible();
  });

  test("column widths stay put when the order changes", async ({ page }) => {
    await page.goto("/demandas");
    const xs = async () =>
      table(page)
        .locator("thead th")
        .evaluateAll((ths) =>
          ths.map((t) => Math.round(t.getBoundingClientRect().x)),
        );
    const before = await xs();
    await table(page).getByRole("button", { name: "Projeto" }).click();
    expect(await xs()).toEqual(before);
  });

  test("the sort select shows only below 60rem and drives the order", async ({
    page,
  }) => {
    await page.goto("/demandas");
    await expect(
      page.getByRole("combobox", { name: "Ordenar por", exact: true }),
    ).toBeHidden();
    await page.setViewportSize({ width: 820, height: 1180 });
    await expect(
      page.getByRole("combobox", { name: "Ordenar por", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("combobox", { name: "Ordenar por", exact: true })
      .selectOption("title:asc");
    await expect(
      page
        .getByRole("list", { name: "Demandas em cartões" })
        .getByRole("listitem")
        .first(),
    ).toContainText("Ajustar rodapé do site");
  });

  test("the three view tabs fit one line on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/demandas");
    const heights = await page
      .getByRole("group", { name: "Visões" })
      .getByRole("button")
      .evaluateAll((els) =>
        els.map((e) => Math.round(e.getBoundingClientRect().height)),
      );
    expect(heights).toHaveLength(3);
    expect(Math.max(...heights)).toBeLessThanOrEqual(50); // uma linha: 44 mínimos de toque
  });
});

test.describe("versão A: contagens como filtro", () => {
  const strip = (page: import("@playwright/test").Page) =>
    page.getByRole("group", { name: "Filtrar por estado" });

  test("shows the real count of each state", async ({ page }) => {
    await page.goto("/demandas");
    await expect(
      strip(page).getByRole("button", { name: "3 A fazer" }),
    ).toBeVisible();
    await expect(
      strip(page).getByRole("button", { name: "3 Fazendo" }),
    ).toBeVisible();
    await expect(
      strip(page).getByRole("button", { name: "3 Feito" }),
    ).toBeVisible();
  });

  test("clicking a count filters the table and clicking again clears it", async ({
    page,
  }) => {
    await page.goto("/demandas");
    const fazendo = strip(page).getByRole("button", { name: /Fazendo/ });
    await fazendo.click();
    await expect(fazendo).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("table", { name: "Demandas" }).locator("tbody tr"),
    ).toHaveCount(3);
    await fazendo.click();
    await expect(
      page.getByRole("table", { name: "Demandas" }).locator("tbody tr"),
    ).toHaveCount(9);
  });

  test("counts react to the project filter", async ({ page }) => {
    await page.goto("/demandas");
    await page
      .getByRole("combobox", { name: "Projeto", exact: true })
      .selectOption({ label: "Painel financeiro" });
    await expect(
      strip(page).getByRole("button", { name: "1 A fazer" }),
    ).toBeVisible();
    await expect(
      strip(page).getByRole("button", { name: "0 Fazendo" }),
    ).toBeVisible();
  });

  test("on a phone the strip fits without horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/demandas");
    await expect(strip(page)).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("visão Por projeto", () => {
  test("switches to one card per project and survives reload", async ({
    page,
  }) => {
    await page.goto("/demandas");
    await expect(async () => {
      await page.getByRole("button", { name: "Por projeto" }).click();
      await expect(page.getByRole("list", { name: "Projetos" })).toBeVisible({
        timeout: 500,
      });
    }).toPass();
    await expect(
      page.getByRole("heading", { name: "Site institucional" }),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByRole("list", { name: "Projetos" })).toBeVisible();
  });

  test("cards stay inside a phone screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() =>
      localStorage.setItem(
        "trilhajp3-demandas",
        JSON.stringify({ layout: "projects" }),
      ),
    );
    await page.goto("/demandas");
    await expect(page.getByRole("list", { name: "Projetos" })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("visão Quadro", () => {
  test(
    "moves a card to another column and survives reload",
    { tag: "@grava" },
    async ({ page }) => {
      await page.goto("/demandas");
      await expect(async () => {
        await page.getByRole("button", { name: "Quadro" }).click();
        await expect(
          page.getByRole("heading", { name: /Fazendo/ }),
        ).toBeVisible({
          timeout: 500,
        });
      }).toPass();
      const fazendo = page.getByRole("heading", { name: /Fazendo/ });
      const before = Number(await fazendo.locator("b").innerText());
      const saved = actionSaved(page);
      await page
        .getByRole("combobox", { name: "Mover Fotos da equipe para" })
        .selectOption("Feito");
      await saved;
      await expect(fazendo.locator("b")).toHaveText(String(before - 1));
      await expect(
        page.getByRole("status").filter({ hasText: "movida para Feito" }),
      ).toContainText("Fotos da equipe movida para Feito");
      await page.reload();
      await expect(
        page.getByRole("heading", { name: /Fazendo/ }),
      ).toBeVisible();
    },
  );

  test("columns stack inside a phone screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() =>
      localStorage.setItem(
        "trilhajp3-demandas",
        JSON.stringify({ layout: "board" }),
      ),
    );
    await page.goto("/demandas");
    await expect(page.getByRole("heading", { name: /A fazer/ })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("move menus are 44px touch targets", async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        "trilhajp3-demandas",
        JSON.stringify({ layout: "board" }),
      ),
    );
    await page.goto("/demandas");
    const box = await page
      .getByRole("combobox", { name: "Mover Fotos da equipe para" })
      .boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("Quadro e Por projeto: largura e ordenação", () => {
  const board = (page: import("@playwright/test").Page) =>
    page.addInitScript(() =>
      localStorage.setItem(
        "trilhajp3-demandas",
        JSON.stringify({ layout: "board" }),
      ),
    );
  const columns = (page: import("@playwright/test").Page) =>
    page
      .locator(".board-columns")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );

  test("columns stack below 60rem (iPad) and sit side by side above", async ({
    page,
  }) => {
    await board(page);
    await page.setViewportSize({ width: 820, height: 1100 });
    await page.goto("/demandas");
    expect(await columns(page)).toBe(1);
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect.poll(() => columns(page)).toBe(3);
  });

  test("the sort control is visible in Quadro on a wide screen", async ({
    page,
  }) => {
    await board(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/demandas");
    await expect(page.getByLabel("Ordenar por")).toBeVisible();
  });
});

test("the top bar fits a 320px phone without horizontal scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const path of ["/", "/demandas"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test("in Foco the project cards stay wide enough to read the progress line", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem("trilhajp3-mode", "focus");
    localStorage.setItem(
      "trilhajp3-demandas",
      JSON.stringify({ layout: "projects" }),
    );
  });
  await page.goto("/demandas");
  const card = page.locator(".project-card").first();
  await expect(card).toBeVisible();
  expect((await card.boundingBox())!.width).toBeGreaterThanOrEqual(240);
  const progress = await card
    .locator(".project-progress")
    .evaluate((el) => Math.round(el.getBoundingClientRect().height));
  expect(progress).toBeLessThanOrEqual(48); // no máximo duas linhas
});

// O Next às vezes restaura a página com a janela aberta (Activity) e às vezes a recria do zero:
// os dois caminhos valem. O retorno de foco após a restauração está no teste unitário de DemandDialog.
test("after back and forward the page is usable, with no modal left stuck", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Todas as demandas" }).click();
  await page.waitForURL("**/demandas");
  const opener = page
    .getByRole("table")
    .getByRole("button", { name: "Fotos da equipe" });
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  // Voltar primeiro fecha a janela (T5b), depois volta para Retomar
  await page.goBack();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.goBack();
  await page.waitForURL((url) => url.pathname === "/");
  await page.goForward();
  await page.waitForURL("**/demandas");
  await expect(opener).toBeAttached();
  const dialog = page.getByRole("dialog");
  if (await dialog.isVisible()) {
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
  // seja qual for o caminho, a página responde e nada ficou inerte
  expect(await page.locator("[inert]").count()).toBe(0);
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(opener).toBeFocused();
});

// Propostas 5 e 9 do impeccable: selects sem zoom no iPhone e títulos com área de toque de 44px.
test("Demandas selects are 16px and demand titles have a 44px touch target", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demandas");
  const sizes = await page
    .locator(".field select")
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).fontSize));
  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) expect(size).toBe("16px");
  const title = page.locator(".resume-open:visible").first();
  expect((await title.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

// Fatia 2 da marca, opção C: no computador e no iPad o tema e o Foco dizem a ação; no celular, só o ícone.
test("theme and focus toggles show their names from 60rem, only the icon on a phone", async ({
  page,
}) => {
  await page.goto("/");
  const label = page.locator(".theme-toggle .toggle-label");
  await expect(label).toHaveText("Escuro");
  await expect(label).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(label).toBeHidden();
  await expect(page.locator(".theme-toggle svg")).toBeVisible();
});

// Tarefa de marca: o nome no topo é o da empresa do usuário, vindo do banco.
test("the top shows the user's company name from the database", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.locator(".side-brand .brand-name", { hasText: "Empresa E2E" }),
  ).toBeVisible();
});

// Revisão final da marca: no iPad (1024) o cabeçalho mono maiúsculo não pode encavalar a coluna vizinha.
test("on an iPad the table headers do not overlap", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 1366 });
  await page.goto("/demandas");
  const boxes = await page
    .locator(".demands-table thead th")
    .evaluateAll((ths) =>
      ths.map((th) => {
        const content = th.firstElementChild ?? th;
        const r = th.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(content);
        return {
          right: r.right,
          contentRight: range.getBoundingClientRect().right,
        };
      }),
    );
  expect(boxes.length).toBe(5);
  for (const b of boxes)
    expect(b.contentRight).toBeLessThanOrEqual(b.right + 0.5);
});
