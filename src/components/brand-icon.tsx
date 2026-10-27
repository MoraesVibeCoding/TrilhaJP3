// Ícone V2: um M que também é um circuito. Os dois nós das pontas são terminais; o vértice central é o pulso.
// Marca: abaixo de 32 px perde os terminais e engrossa o traço; mínimo de 24 px.
export function BrandIcon({ size = 32 }: { size?: number }) {
  const px = Math.max(24, size);
  const small = px < 32;
  return (
    <svg
      className="brand-icon"
      width={px}
      height={px}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={small ? "M12 50V14L32 38L52 14V50" : "M12 46V16L32 38L52 16V46"}
        stroke="currentColor"
        strokeWidth={small ? 9 : 5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {!small && (
        <>
          <circle data-terminal cx="12" cy="52" r="5" strokeWidth="4" />
          <circle data-terminal cx="52" cy="52" r="5" strokeWidth="4" />
          <circle
            cx="32"
            cy="38"
            r="12"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
        </>
      )}
      <circle data-pulse cx="32" cy="38" r={small ? 9 : 6} />
    </svg>
  );
}
