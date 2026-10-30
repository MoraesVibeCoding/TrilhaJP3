import type { ResumeItem } from "@/lib/resume";

export function DoneToday({ items }: { items: readonly ResumeItem[] }) {
  if (items.length === 0) return null;
  return (
    <details className="detail-group done-today">
      <summary>
        Feito hoje <span className="count">({items.length})</span>
      </summary>
      <ul className="detail-list">
        {items.map((item) => (
          <li key={item.id}>
            {item.title}
            <span className="detail-meta"> {item.projectName}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
