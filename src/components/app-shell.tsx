"use client";

import { signOut } from "@/app/entrar/actions";
import { BrandIcon } from "./brand-icon";
import { CaptureButton } from "./capture-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ModeToggle } from "./mode-toggle";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Retomar" },
  { href: "/demandas", label: "Demandas" },
  { href: "/projetos", label: "Projetos" },
];

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="shell" data-nav-open={open}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="shell-bar">
        <button
          type="button"
          className="menu-button"
          aria-expanded={open}
          aria-controls="navegacao"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <span className="brand">
          <BrandIcon />
          <span className="brand-name">TrilhaJp3</span>
        </span>
        <CaptureButton />
        <ModeToggle />
        <ThemeToggle />
      </header>
      <aside className="shell-side" id="navegacao">
        <span className="brand side-brand">
          <BrandIcon />
          <span className="brand-name">TrilhaJp3</span>
        </span>
        <nav aria-label="Principal">
          <ul>
            {NAV.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isCurrent(pathname, href) ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Logo abaixo da navegação: no pé ficaria fora da tela e, no celular, sob o botão flutuante */}
        <form action={signOut}>
          <button type="submit" className="signout-button">
            Sair
          </button>
        </form>
        <p className="side-foot">Moraes CodeVibe</p>
      </aside>
      <main id="conteudo" className="shell-main">
        {children}
      </main>
    </div>
  );
}
