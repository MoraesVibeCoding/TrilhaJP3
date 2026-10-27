"use client";

import { useDemandState } from "@/lib/use-demand-state";
import { useWithCaptured } from "@/lib/use-captured";
import { DemandDetail } from "./demand-detail";
import { DemandDialog } from "./demand-dialog";
import { demandPath, useOpenDemand } from "@/lib/demand-url";
import { DoneToday } from "./done-today";
import { NowBlock } from "./now-block";
import { ResumeList } from "./resume-list";
import {
  selectDoneToday,
  selectNow,
  selectResume,
  type ResumeDemand,
} from "@/lib/resume";

export type BoardDemand = ResumeDemand & {
  comments: readonly { author: string; at: string; text: string }[];
  attachments: readonly { name: string }[];
  history: readonly { at: string; text: string }[];
};

export function ResumeBoard({
  demands,
  projects,
  now,
}: {
  demands: readonly BoardDemand[];
  projects: readonly { id: string; name: string }[];
  now: Date;
}) {
  const { current, conclude, toggleNow, failure } = useDemandState(
    useWithCaptured(demands),
  );
  const [openId, openDemand, closeDemand] = useOpenDemand();

  const nowPick = selectNow(current, projects);
  const rest = selectResume(current, projects).filter(
    (item) => item.id !== nowPick?.item.id,
  );
  const done = selectDoneToday(current, projects, now);
  const open = current.find((d) => d.id === openId) ?? null;

  return (
    <>
      {nowPick && (
        <NowBlock
          item={nowPick.item}
          suggested={nowPick.suggested}
          onConclude={conclude}
          onOpen={openDemand}
        />
      )}
      {(rest.length > 0 || !nowPick) && (
        <div className="resume-rest">
          {rest.length > 0 && <h2>Em andamento ({rest.length})</h2>}
          <ResumeList items={rest} now={now} onOpen={openDemand} />
        </div>
      )}
      <DoneToday items={done} />
      <DemandDialog
        open={open !== null}
        onClose={closeDemand}
        title={open?.title ?? ""}
        pageHref={open ? demandPath(open.id) : undefined}
      >
        {open && (
          <DemandDetail
            data={open}
            subtasks={open.subtasks}
            isNow={Boolean(open.isNow)}
            onConclude={conclude}
            onToggleNow={toggleNow}
          />
        )}
      </DemandDialog>
      <p role="alert" className="board-message">
        {failure}
      </p>
    </>
  );
}
