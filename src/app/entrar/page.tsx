import type { Metadata } from "next";
import { BrandIcon } from "@/components/brand-icon";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Entrar · TrilhaJp3" };

// Proposta B (mesa dividida), escolhida pelo Pedro em 2026-10-26.
export default function LoginPage() {
  return (
    <div className="login">
      <aside className="login-band">
        <span className="brand">
          <BrandIcon />
          <span className="brand-name">TrilhaJp3</span>
        </span>
        <p className="login-claim">Projetos e demandas da Moraes CodeVibe.</p>
      </aside>
      <main className="login-main">
        <div className="login-box">
          <h1 className="login-title">Entrar</h1>
          <LoginForm />
          <p className="login-note">
            Esqueceu a senha? Peça a troca a quem administra a conta da empresa.
          </p>
        </div>
      </main>
    </div>
  );
}
