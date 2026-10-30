// Filete segmentado: um traço por passo, os concluídos preenchidos. O texto ao lado diz o mesmo.
// Com `signal`, o passo atual leva o sinal da marca: só na demanda Agora, para aparecer uma vez por tela.
export function StepProgress({
  done,
  total,
  signal = false,
}: {
  done: number;
  total: number;
  signal?: boolean;
}) {
  if (total <= 0) return null;
  return (
    <span className="step-progress" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          data-filled={i < done}
          data-current={signal && i === done ? "" : undefined}
        />
      ))}
    </span>
  );
}
