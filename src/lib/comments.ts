const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

// "hoje, 15h", "ontem, 9h", "30 de out., 9h"; o ano só aparece quando não é o atual.
export function formatCommentTime(iso: string, now: Date): string {
  const when = new Date(iso);
  const hour = `${when.getHours()}h`;
  const days = Math.round((startOfDay(now) - startOfDay(when)) / 86_400_000);
  if (days <= 0) return `hoje, ${hour}`;
  if (days === 1) return `ontem, ${hour}`;
  const day = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    ...(when.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  }).format(when);
  return `${day}, ${hour}`;
}

export type CommentPart = { text: string } | { href: string };

// Só http:// e https:// viram link (nunca javascript: e afins). A pontuação no fim fica fora do link.
const LINK = /https?:\/\/[^\s<>"]+?(?=[.,;:!?)]*(?:\s|$))/g;

export function linkParts(text: string): CommentPart[] {
  const parts: CommentPart[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    parts.push({ href: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
