import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  // T3: o app exige login; global-setup.ts entra com um usuário fictício e apaga no fim.
  globalSetup: "./e2e/global-setup.ts",
  // T5: as telas leem e gravam no mesmo banco; um worker só, para nenhum teste ler no meio da gravação de outro.
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    storageState: "e2e/.auth/user.json",
    // shortcut: local sandbox ships its own Chromium; CI installs the matching one.
    launchOptions: { executablePath: process.env.E2E_CHROMIUM_PATH },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
