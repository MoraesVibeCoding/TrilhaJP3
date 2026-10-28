// Ícones de interface do design system Moraes Coding (componente Icone): grade 24, traço de 2px,
// pontas retas, cantos vivos, cor do texto. Sol, lua e alvo não existem no manual: foram desenhados
// no mesmo traço (fatia 2 da marca, opção C, aprovada pelo Pedro em 2026-10-28).
const PATHS = {
  menu: "M4 6H20M4 12H20M4 18H20",
  fechar: "M5 5L19 19M19 5L5 19",
  adicionar: "M12 4V20M4 12H20",
  "seta-baixo": "M5 14L12 21L19 14M12 21V3",
  "seta-cima": "M5 10L12 3L19 10M12 3V21",
  painel: "M4 4H10V10H4ZM14 4H20V10H14ZM4 14H10V20H4ZM14 14H20V20H14Z",
  sol: "M16 12A4 4 0 1 1 8 12A4 4 0 1 1 16 12ZM12 2V5M12 19V22M2 12H5M19 12H22M4.9 4.9L7 7M17 17L19.1 19.1M4.9 19.1L7 17M17 7L19.1 4.9",
  lua: "M20 14.5A8 8 0 1 1 9.5 4A6.5 6.5 0 0 0 20 14.5Z",
  alvo: "M20 12A8 8 0 1 1 4 12A8 8 0 1 1 20 12ZM14 12A2 2 0 1 1 10 12A2 2 0 1 1 14 12Z",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
