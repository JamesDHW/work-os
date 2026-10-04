import { z } from "zod";

import type { Project } from "@work-os/domain/projects/Project";

import {
  ConnectionIdSchema,
  EnvironmentIdSchema,
  ProjectIdSchema,
  RunnerIdSchema,
  WorkspaceIdSchema,
} from "../common/identifiers.schema.ts";

export const ProjectSchema = z
  .object({
    id: ProjectIdSchema,
    workspaceId: WorkspaceIdSchema,
    name: z.string(),
    location: z.object({ runnerId: RunnerIdSchema, path: z.string() }),
    environmentId: EnvironmentIdSchema,
    connectionIds: z.array(ConnectionIdSchema),
    createdAt: z.string(),
  })
  .meta({ id: "Project" }) satisfies z.ZodType<Project>;

export const CreateProjectRequestSchema = z
  .object({
    name: z.string().min(1).max(100),
    runnerId: RunnerIdSchema,
    path: z.string().min(1),
    environmentId: EnvironmentIdSchema,
    connectionIds: z.array(ConnectionIdSchema).default([]),
  })
  .meta({ id: "CreateProjectRequest" });

export const ProjectParamsSchema = z.object({ projectId: ProjectIdSchema });
