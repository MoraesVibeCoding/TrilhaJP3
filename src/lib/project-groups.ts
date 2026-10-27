import type { DemandRow } from "./demands-view";
import type { DemandState } from "./demand-labels";

export type ProjectGroup = {
  id: string;
  name: string;
  counts: Record<DemandState, number>;
  done: number;
  total: number;
  items: DemandRow[];
};

// Os números do cartão vêm de countRows (sem o filtro de estado); a lista, de visible.
export function groupByProject(
  visible: readonly DemandRow[],
  countRows: readonly DemandRow[],
  projects: readonly { id: string; name: string }[],
  includeEmpty: boolean,
): ProjectGroup[] {
  return projects
    .map((p) => {
      const mine = countRows.filter((r) => r.projectId === p.id);
      const counts: Record<DemandState, number> = {
        "A fazer": 0,
        Fazendo: 0,
        Feito: 0,
      };
      for (const r of mine) counts[r.state]++;
      return {
        id: p.id,
        name: p.name,
        counts,
        done: counts.Feito,
        total: mine.length,
        items: visible.filter((r) => r.projectId === p.id),
      };
    })
    .filter((g) => g.total > 0 || includeEmpty);
}
