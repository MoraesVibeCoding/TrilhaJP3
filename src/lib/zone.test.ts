// O app mostra datas no fuso de São Paulo, qualquer que seja o fuso do servidor (o CI e a Vercel rodam em UTC).
import { afterAll, beforeAll, expect, test } from "vitest";
import { dayLabel, formatCommentTime } from "./comments";
import { formatDueDate } from "./demand-labels";
import { formatActivity, selectDoneToday } from "./resume";
import { zoned } from "./zone";

// Como um servidor na Vercel ou no CI: o Node aplica a troca de TZ na hora.
const tz = process.env.TZ;
beforeAll(() => {
  process.env.TZ = "UTC";
});
afterAll(() => {
  process.env.TZ = tz;
});

test("este arquivo roda mesmo em UTC", () => {
  expect(new Date("2026-11-04T02:00:00Z").getHours()).toBe(2);
});

// 4 de nov., 9h em São Paulo
const now = new Date("2026-11-04T12:00:00Z");
// 3 de nov., 23h em São Paulo, mas já 4 de nov. em UTC
const lateNight = "2026-11-04T02:00:00Z";

test("lê ano, mês, dia e hora em São Paulo", () => {
  expect(zoned(new Date(lateNight))).toEqual({
    year: 2026,
    month: 11,
    day: 3,
    hour: 23,
  });
  expect(zoned(new Date("2027-01-01T02:30:00Z"))).toEqual({
    year: 2026,
    month: 12,
    day: 31,
    hour: 23,
  });
});

test("23h da véspera em São Paulo é ontem, mesmo que em UTC já seja hoje", () => {
  expect(dayLabel(lateNight, now)).toBe("ontem");
  expect(formatCommentTime(lateNight, now)).toBe("ontem, 23h");
  expect(formatActivity(lateNight, now)).toBe("ontem, 23h");
  expect(formatCommentTime("2026-11-04T11:00:00Z", now)).toBe("hoje, 8h");
});

test("o dia e o ano do rótulo seguem São Paulo", () => {
  // 31 de dez. às 23h em São Paulo; em UTC já é 2027
  const newYear = new Date("2027-01-01T02:30:00Z");
  expect(dayLabel("2026-11-30T12:00:00Z", newYear)).toBe("30 de nov.");
  expect(formatDueDate("2026-12-31", newYear)).toBe("31 de dez.");
});

test("Feito hoje conta o dia de São Paulo", () => {
  const done = (doneAt: string) => ({
    id: doneAt,
    projectId: "p1",
    title: "Feita",
    state: "Feito" as const,
    priority: "Média" as const,
    lastActivityAt: doneAt,
    doneAt,
    subtasks: [],
  });
  const items = selectDoneToday(
    [done(lateNight), done("2026-11-04T10:00:00Z")],
    [{ id: "p1", name: "Site" }],
    now,
  );
  expect(items.map((i) => i.id)).toEqual(["2026-11-04T10:00:00Z"]);
});
