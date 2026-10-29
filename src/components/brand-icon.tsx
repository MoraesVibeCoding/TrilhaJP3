// Ícone Moraes Coding: um M de cinco barras de BI sobre a linha de base; a última, no sinal, é "o número de hoje".
// Geometria do mc-icone-*.svg (docs/brand/moraes-coding/logo). Mínimo de 24 px.
const BARS = [
  { x: 4, y: 10, height: 44 },
  { x: 15, y: 22, height: 32 },
  { x: 26, y: 34, height: 20 },
  { x: 37, y: 22, height: 32 },
  { x: 48, y: 10, height: 44 },
];

export function BrandIcon({ size = 32 }: { size?: number }) {
  const px = Math.max(24, size);
  return (
    <svg
      className="brand-icon"
      width={px}
      height={px}
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
    >
      {BARS.map((bar, i) => (
        <rect
          key={bar.x}
          data-bar=""
          data-pulse={i === BARS.length - 1 ? "" : undefined}
          x={bar.x}
          y={bar.y}
          width={8}
          height={bar.height}
        />
      ))}
      <rect data-base="" x={2} y={56} width={60} height={2} />
    </svg>
  );
}
