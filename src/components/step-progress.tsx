// Filete segmentado: um traço por passo, os concluídos preenchidos. O texto ao lado diz o mesmo.
export function StepProgress({ done, total }: { done: number; total: number }) {
  if (total <= 0) return null;
  return (
    <span className="step-progress" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} data-filled={i < done} />
      ))}
    </span>
  );
}
