import { defineConfig } from "vitest/config";

// Testes de integração contra o Supabase de teste (rede e segredos): npm run test:db.
export default defineConfig({
  test: {
    include: ["supabase/tests/**/*.test.ts"],
    environment: "node",
    testTimeout: 30_000,
    fileParallelism: false,
  },
});
