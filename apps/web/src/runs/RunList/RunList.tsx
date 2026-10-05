import { Link } from "@tanstack/react-router";
import type { FC } from "react";

import type { RunSummary } from "../../api/apiTypes.ts";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { describeRun } from "../describeRun.ts";
import { RunStatusBadge } from "../RunStatusBadge/RunStatusBadge.tsx";
import { runList, runMeta, runRow, runText } from "./RunList.css.ts";

export type RunListProps = {
  readonly workspaceId: string;
  readonly runs: readonly RunSummary[];
  readonly emptyText: string;
};

export const RunList: FC<RunListProps> = ({ runs, emptyText, workspaceId }) => {
  if (runs.length === 0) return <EmptyState>{emptyText}</EmptyState>;

  return (
    <ul className={runList}>
      {runs.map((run) => (
        <li key={run.id}>
          <Link className={runRow} to="/w/$workspaceId/runs/$runId" params={{ workspaceId: workspaceId, runId: run.id }}>
            <RunStatusBadge status={run.state.status} />
            <span className={runText}>{describeRun(run)}</span>
            <span className={runMeta}>
              {run.standardId} · {new Date(run.updatedAt).toLocaleString()}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};
