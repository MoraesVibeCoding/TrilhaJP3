import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    exclude: ["e2e/**", "node_modules/**"],
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**", "src/**/*.d.ts"],
      reporter: ["text-summary", "lcov", "json-summary"],
      // CONSTRAINTS.md: o valor medido em 2026-10-23 menos 0,5%
      thresholds: {
        lines: 96.6,
        statements: 96.4,
        branches: 92.9,
        functions: 95.6,
      },
    },
  },
});
