// Ícones de interface da marca Moraes Coding: grade de 24, traço de 2px, pontas retas, cor do texto.
// Traçados de docs/brand/moraes-coding/icones; só entram aqui os que a interface usa.
// sol, lua e foco não existem no conjunto da marca: desenhados no mesmo traço.
const PATHS = {
  menu: "M4 6H20M4 12H20M4 18H20",
  fechar: "M5 5L19 19M19 5L5 19",
  adicionar: "M12 4V20M4 12H20",
  "seta-cima": "M5 10L12 3L19 10M12 3V21",
  "seta-baixo": "M5 14L12 21L19 14M12 21V3",
  painel: "M4 4H10V10H4ZM14 4H20V10H14ZM4 14H10V20H4ZM14 14H20V20H14Z",
  foco: "M21 12A9 9 0 1 1 3 12A9 9 0 1 1 21 12ZM12 12H12.01",
  sol: "M16 12A4 4 0 1 1 8 12A4 4 0 1 1 16 12ZM12 2V4M12 20V22M2 12H4M20 12H22M5 5L6.5 6.5M17.5 17.5L19 19M5 19L6.5 17.5M17.5 6.5L19 5",
  lua: "M20 14.5A8 8 0 0 1 9.5 4A8 8 0 1 0 20 14.5Z",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
