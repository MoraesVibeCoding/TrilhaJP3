import { z } from "zod";

// Validação na borda (docs/SPEC.md 4.3): o formulário chega do navegador e não é confiável.
const schema = z.object({
  email: z.string().trim().max(254).pipe(z.email()),
  password: z.string().min(1).max(200),
});

export function parseSignIn(form: FormData) {
  const result = schema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  return result.success ? result.data : null;
}
