// O app mostra datas e horas no fuso de São Paulo, qualquer que seja o fuso de quem desenha a tela: o servidor
// (UTC na Vercel e no CI) e o navegador chegam ao mesmo "hoje", e a hidratação não troca o texto.
export const TIME_ZONE = "America/Sao_Paulo";

const PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

// Ano, mês (1 a 12), dia e hora do instante em São Paulo.
export function zoned(date: Date) {
  const p = Object.fromEntries(
    PARTS.formatToParts(date).map(({ type, value }) => [type, Number(value)]),
  );
  return { year: p.year, month: p.month, day: p.day, hour: p.hour };
}

// O dia de São Paulo como um número inteiro: a diferença entre dois é a distância em dias de calendário.
export function dayNumber(date: Date) {
  const { year, month, day } = zoned(date);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}
