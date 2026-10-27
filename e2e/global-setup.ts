// Usuário fictício por execução (T3): entra uma vez pela tela real e guarda a sessão para os outros testes.
// Precisa de NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY; usuário e empresa são apagados no fim.
import { chromium, type FullConfig } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

export const STORAGE_STATE = "e2e/.auth/user.json";

export default async function globalSetup(config: FullConfig) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const email = `e2e-${crypto.randomUUID().slice(0, 8)}@example.test`;
  const password = crypto.randomUUID();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    throw new Error(
      `Não criou o usuário do E2E (o projeto gratuito pode estar pausado): ${error.message}`,
    );
  }
  // T4: /projetos exige empresa; a do E2E sai junto com o usuário (vínculos e projetos em cascata).
  const org = await admin
    .from("organizations")
    .insert({ name: `E2E ${email}` })
    .select("id")
    .single();
  if (org.error) throw org.error;
  const link = await admin.from("memberships").insert({
    organization_id: org.data.id,
    user_id: data.user.id,
    role: "owner",
  });
  if (link.error) throw link.error;
  process.env.E2E_EMAIL = email;
  process.env.E2E_PASSWORD = password;

  const { baseURL, launchOptions } = config.projects[0].use;
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ baseURL });
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("/");
  await page.context().storageState({ path: STORAGE_STATE });
  await browser.close();

  return async () => {
    await admin.from("organizations").delete().eq("id", org.data.id);
    await admin.auth.admin.deleteUser(data.user.id);
  };
}
