import { expect, test } from "@playwright/test";

test("the manifest and every icon it lists are served at the declared size", async ({
  request,
}) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest.display).toBe("standalone");
  for (const icon of manifest.icons) {
    const img = await request.get(icon.src);
    expect(img.ok(), icon.src).toBe(true);
    const bytes = await img.body();
    // largura e altura ficam nos bytes 16 a 24 do cabeçalho PNG
    const size = `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
    expect(size, icon.src).toBe(icon.sizes);
  }
});

test("the head links the manifest, the apple icon and a bar color per theme", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/manifest.webmanifest",
  );
  const apple = page.locator('link[rel="apple-touch-icon"]');
  await expect(apple).toHaveAttribute("sizes", "180x180");
  const themes = await page
    .locator('meta[name="theme-color"]')
    .evaluateAll((els) =>
      els.map((e) => `${e.getAttribute("media")}=${e.getAttribute("content")}`),
    );
  expect(themes).toEqual([
    "(prefers-color-scheme: light)=#0C2A1E",
    "(prefers-color-scheme: dark)=#08180F",
  ]);
  await expect(
    page.locator('meta[name="apple-mobile-web-app-title"]'),
  ).toHaveAttribute("content", "Trilha JP3");
});
