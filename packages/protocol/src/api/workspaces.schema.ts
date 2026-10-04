import { z } from "zod";

import { UserIdSchema, WorkspaceIdSchema } from "../common/identifiers.schema.ts";

export const UserSchema = z
  .object({ id: UserIdSchema, displayName: z.string(), createdAt: z.string() })
  .meta({ id: "User" });

export const WorkspaceSchema = z
  .object({
    id: WorkspaceIdSchema,
    name: z.string(),
    kind: z.enum(["personal", "organisation"]),
    createdAt: z.string(),
  })
  .meta({ id: "Workspace" });

export const SessionResponseSchema = z
  .object({ user: UserSchema, workspaces: z.array(WorkspaceSchema) })
  .meta({ id: "SessionResponse" });

export const WorkspaceParamsSchema = z.object({ workspaceId: WorkspaceIdSchema });
