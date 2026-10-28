// Logo Moraes Coding, variante ícone: o M de cinco barras de BI sobre a linha de base; a última barra
// é "o número de hoje" (geometria do componente Logo do design system). Barras em texto-titulo, a de
// hoje em destaque; as cores vêm do CSS (.brand-icon) e trocam com o tema. Mínimo de 24 px.
const BARS = [
  [4, 10, 44],
  [15, 22, 32],
  [26, 34, 20],
  [37, 22, 32],
];

export function BrandIcon({ size = 32 }: { size?: number }) {
  const px = Math.max(24, size);
  return (
    <svg
      className="brand-icon"
      width={px}
      height={px}
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      {BARS.map(([x, y, h]) => (
        <rect key={x} data-bar="" x={x} y={y} width="8" height={h} />
      ))}
      <rect data-bar="hoje" x="48" y="10" width="8" height="44" />
      <rect data-base="" x="2" y="56" width="60" height="2" />
    </svg>
  );
}
