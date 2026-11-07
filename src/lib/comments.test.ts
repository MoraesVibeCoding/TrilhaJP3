import { expect, test } from "vitest";
import { dayLabel, formatCommentTime, linkParts } from "./comments";

const now = new Date(2026, 10, 3, 16, 0);

test("data do comentário: hoje, ontem, dia do mês e ano quando é outro", () => {
  expect(
    formatCommentTime(new Date(2026, 10, 3, 15, 20).toISOString(), now),
  ).toBe("hoje, 15h");
  expect(
    formatCommentTime(new Date(2026, 10, 2, 9, 0).toISOString(), now),
  ).toBe("ontem, 9h");
  expect(
    formatCommentTime(new Date(2026, 9, 30, 9, 0).toISOString(), now),
  ).toBe("30 de out., 9h");
  expect(
    formatCommentTime(new Date(2025, 11, 1, 8, 0).toISOString(), now),
  ).toBe("1 de dez. de 2025, 8h");
});

test("só http e https viram link; o resto continua texto", () => {
  expect(
    linkParts("veja https://exemplo.com.br/a?b=1 e javascript:alert(1)"),
  ).toEqual([
    { text: "veja " },
    { href: "https://exemplo.com.br/a?b=1" },
    { text: " e javascript:alert(1)" },
  ]);
  expect(linkParts("<img src=x onerror=alert(1)>")).toEqual([
    { text: "<img src=x onerror=alert(1)>" },
  ]);
});

test("pontuação no fim da frase não entra no link", () => {
  expect(linkParts("Arquivo em http://a.com/x.")).toEqual([
    { text: "Arquivo em " },
    { href: "http://a.com/x" },
    { text: "." },
  ]);
});

test("rótulo do dia, usado nos títulos do histórico", () => {
  expect(dayLabel(new Date(2026, 10, 3, 1, 0).toISOString(), now)).toBe("hoje");
  expect(dayLabel(new Date(2026, 10, 2, 23, 0).toISOString(), now)).toBe(
    "ontem",
  );
  expect(dayLabel(new Date(2026, 9, 30, 9, 0).toISOString(), now)).toBe(
    "30 de out.",
  );
});
