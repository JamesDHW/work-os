import type { RunnerStore } from "@work-os/core/runners/RunnerStore";
import { toRunnerId, toWorkspaceId, type RunnerId, type WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Runner } from "@work-os/domain/runners/Runner";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { and, asc, eq, type SQL } from "drizzle-orm";

import { runners } from "../tables/runners.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

type RunnerRow = typeof runners.$inferSelect;

export const createRunnerStore = (database: WorkOsDatabase): RunnerStore => {
  const findOne = async (condition: SQL | undefined, description: string): Promise<Runner | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(runners).where(condition));
    if (rows instanceof WorkOsError) return rows;

    const row = rows[0];
    if (row === undefined) return new NotFoundError(`${description} is not paired.`);
    return toRunner(row);
  };

  const createRunner = async (runner: Runner, tokenHash: string): Promise<Runner | WorkOsError> => {
    const inserted = await tryCatchAsync(() => database.insert(runners).values({ ...runner, tokenHash }));
    if (inserted instanceof WorkOsError) return inserted;

    return runner;
  };

  const listRunners = async (workspaceId: WorkspaceId): Promise<readonly Runner[] | WorkOsError> => {
    const rows = await tryCatchAsync(() =>
      database.select().from(runners).where(eq(runners.workspaceId, workspaceId)).orderBy(asc(runners.name)),
    );
    if (rows instanceof WorkOsError) return rows;

    return rows.map(toRunner);
  };

  const findRunner = async (workspaceId: WorkspaceId, runnerId: RunnerId): Promise<Runner | WorkOsError> => {
    return findOne(and(eq(runners.workspaceId, workspaceId), eq(runners.id, runnerId)), `Machine ${runnerId}`);
  };

  const findRunnerByTokenHash = async (tokenHash: string): Promise<Runner | WorkOsError> => {
    return findOne(eq(runners.tokenHash, tokenHash), "This machine");
  };

  const markRunnerSeen = async (runnerId: RunnerId, seenAt: string): Promise<WorkOsError | undefined> => {
    const updated = await tryCatchAsync(() => database.update(runners).set({ lastSeenAt: seenAt }).where(eq(runners.id, runnerId)));
    return updated instanceof WorkOsError ? updated : undefined;
  };

  return { createRunner, listRunners, findRunner, findRunnerByTokenHash, markRunnerSeen };
};

const toRunner = (row: RunnerRow): Runner => ({
  id: toRunnerId(row.id),
  workspaceId: toWorkspaceId(row.workspaceId),
  name: row.name,
  platform: row.platform,
  pairedAt: row.pairedAt,
  lastSeenAt: row.lastSeenAt,
});
