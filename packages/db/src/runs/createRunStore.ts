import type { RunChange, RunListFilter, RunStore } from "@work-os/core/runs/RunStore";
import { toProjectId, toRunId, toStandardId, toWorkspaceId, type RunId, type WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Run } from "@work-os/domain/runs/Run";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { and, desc, eq, notInArray } from "drizzle-orm";

import { runs } from "../tables/runs.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";
import { FINISHED_RUN_STATUSES, RUN_LIST_LIMIT } from "./runs.constants.ts";

type RunRow = typeof runs.$inferSelect;

export const createRunStore = (database: WorkOsDatabase): RunStore => {
  const createRun = async (run: Run): Promise<Run | WorkOsError> => {
    const inserted = await tryCatchAsync(() => database.insert(runs).values({ ...run, status: run.state.status }));
    if (inserted instanceof WorkOsError) return inserted;

    return run;
  };

  const findRun = async (runId: RunId): Promise<Run | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(runs).where(eq(runs.id, runId)));
    if (rows instanceof WorkOsError) return rows;

    const row = rows[0];
    if (row === undefined) return new NotFoundError(`Run ${runId} does not exist.`);
    return toRun(row);
  };

  const listRuns = async (workspaceId: WorkspaceId, filter: RunListFilter): Promise<readonly Run[] | WorkOsError> => {
    const projectCondition = filter.projectId === undefined ? undefined : eq(runs.projectId, filter.projectId);
    const condition = and(eq(runs.workspaceId, workspaceId), projectCondition);
    const rows = await tryCatchAsync(() => database.select().from(runs).where(condition).orderBy(desc(runs.createdAt)).limit(RUN_LIST_LIMIT));
    if (rows instanceof WorkOsError) return rows;

    return rows.map(toRun);
  };

  const listActiveRuns = async (): Promise<readonly Run[] | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(runs).where(notInArray(runs.status, [...FINISHED_RUN_STATUSES])));
    if (rows instanceof WorkOsError) return rows;

    return rows.map(toRun);
  };

  const updateRun = async (runId: RunId, change: RunChange): Promise<Run | WorkOsError> => {
    const statusChange = change.state === undefined ? {} : { status: change.state.status };
    const updated = await tryCatchAsync(() => database.update(runs).set({ ...change, ...statusChange }).where(eq(runs.id, runId)));
    if (updated instanceof WorkOsError) return updated;

    return findRun(runId);
  };

  return { createRun, findRun, listRuns, listActiveRuns, updateRun };
};

const toRun = (row: RunRow): Run => ({
  id: toRunId(row.id),
  workspaceId: toWorkspaceId(row.workspaceId),
  projectId: toProjectId(row.projectId),
  standardId: toStandardId(row.standardId),
  principal: row.principal,
  spec: row.spec,
  addedCapabilities: row.addedCapabilities,
  state: row.state,
  summary: row.summary,
  outputs: row.outputs,
  conversationId: row.conversationId,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
