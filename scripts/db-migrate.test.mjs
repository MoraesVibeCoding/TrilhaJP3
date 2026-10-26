import { expect, test } from "vitest";
import { pending, projectRef, sqlString, versionOf } from "./db-migrate.mjs";

test("versionOf reads the CLI file name: 14-digit version and name", () => {
  expect(versionOf("20261026170000_organizations.sql")).toEqual({
    version: "20261026170000",
    name: "organizations",
  });
  expect(() => versionOf("organizations.sql")).toThrow(/nome inválido/);
  expect(() => versionOf("2026_org.sql")).toThrow(/nome inválido/);
});

test("pending keeps the files not yet applied, in version order", () => {
  const files = [
    "20261027000000_b.sql",
    "20261026000000_a.sql",
    "20261028000000_c.sql",
  ];
  expect(pending(files, ["20261026000000"])).toEqual([
    "20261027000000_b.sql",
    "20261028000000_c.sql",
  ]);
  expect(
    pending(
      files,
      files.map((f) => versionOf(f).version),
    ),
  ).toEqual([]);
});

test("sqlString quotes a literal, doubling single quotes", () => {
  expect(sqlString("it's")).toBe("'it''s'");
  expect(sqlString("a\\b")).toBe("'a\\b'");
});

test("projectRef takes the ref from the project URL and rejects anything else", () => {
  expect(projectRef("https://abcdefghijklmnopqrst.supabase.co")).toBe(
    "abcdefghijklmnopqrst",
  );
  expect(projectRef("https://abcdefghijklmnopqrst.supabase.co/")).toBe(
    "abcdefghijklmnopqrst",
  );
  expect(() => projectRef("https://example.com")).toThrow(/URL do Supabase/);
});
