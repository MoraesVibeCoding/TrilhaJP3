// Ícones de interface da marca Moraes Coding: grade de 24, traço de 2px, pontas retas, cor do texto.
// Traçados de docs/brand/moraes-coding/icones; só entram aqui os que a interface usa.
// sol e lua não existem no conjunto da marca: desenhados no mesmo traço, para o botão de tema dizer o tema de destino.
const PATHS = {
  inicio: "M4 11L12 4L20 11M6 9.5V20H18V9.5M10 20V14H14V20",
  menu: "M4 6H20M4 12H20M4 18H20",
  pasta: "M3 6H10L12 8H21V19H3Z",
  sair: "M10 4H4V20H10M14 8L18 12L14 16M18 12H9",
  fechar: "M5 5L19 19M19 5L5 19",
  adicionar: "M12 4V20M4 12H20",
  "mais-opcoes": "M5 12H5.01M12 12H12.01M19 12H19.01",
  editar: "M4 20V16L15 5L19 9L8 20ZM12 8L16 12",
  excluir: "M4 7H20M9 7V4H15V7M6 7L7 20H17L18 7M10 11V16M14 11V16",
  "seta-cima": "M5 10L12 3L19 10M12 3V21",
  "seta-baixo": "M5 14L12 21L19 14M12 21V3",
  painel: "M4 4H10V10H4ZM14 4H20V10H14ZM4 14H10V20H4ZM14 14H20V20H14Z",
  visualizar:
    "M2 12C5 6.5 19 6.5 22 12C19 17.5 5 17.5 2 12ZM15 12A3 3 0 1 1 9 12A3 3 0 1 1 15 12Z",
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
