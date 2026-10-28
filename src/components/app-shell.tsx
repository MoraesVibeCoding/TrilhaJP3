"use client";

import { signOut } from "@/app/entrar/actions";
import { BrandIcon } from "./brand-icon";
import { Icon } from "./icon";
import { CaptureButton } from "./capture-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
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

function NavList({ pathname }: { pathname: string }) {
  return (
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
  );
}

function CurrentNavList() {
  return <NavList pathname={usePathname()} />;
}

export function AppShell({
  children,
  company,
}: {
  children: ReactNode;
  // nome da empresa do usuário, lido do banco pelo layout (marca configurável por cliente)
  company?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

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
          <Icon name="menu" />
        </button>
        <span className="brand">
          <BrandIcon />
          <span className="brand-name">{company}</span>
        </span>
        <CaptureButton />
        <ModeToggle />
        <ThemeToggle />
      </header>
      <aside className="shell-side" id="navegacao">
        <span className="brand side-brand">
          <BrandIcon />
          <span className="brand-name">{company}</span>
        </span>
        <nav aria-label="Principal">
          {/* Em /demandas/[id] o caminho só existe na requisição: sem Suspense o build falha. */}
          <Suspense fallback={<NavList pathname="" />}>
            <CurrentNavList />
          </Suspense>
        </nav>
        {/* Logo abaixo da navegação: no pé ficaria fora da tela e, no celular, sob o botão flutuante */}
        <form action={signOut}>
          <button type="submit" className="signout-button">
            Sair
          </button>
        </form>
      </aside>
      <main id="conteudo" className="shell-main">
        {children}
      </main>
    </div>
  );
}
