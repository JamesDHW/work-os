import { z } from "zod";

import {
  toAgentId,
  toCapabilityId,
  toConnectionId,
  toEnvironmentId,
  toGrantId,
  toInboxItemId,
  toObservationId,
  toProjectId,
  toRunId,
  toRunnerId,
  toStandardId,
  toUserId,
  toWorkspaceId,
} from "@work-os/domain/identifiers/Identifiers";

const identifier = z.string().min(1).max(200);
const slug = z.string().regex(/^[a-z0-9][a-z0-9-]*$/u, "Use lowercase letters, digits and hyphens.");
const capabilityName = z.string().regex(/^[a-z0-9]+(?:\.[a-z0-9-]+)+$/u, "Use dotted lowercase names such as github.pr.create.");

export const UserIdSchema = identifier.transform(toUserId);
export const WorkspaceIdSchema = identifier.transform(toWorkspaceId);
export const ProjectIdSchema = identifier.transform(toProjectId);
export const RunnerIdSchema = identifier.transform(toRunnerId);
export const RunIdSchema = identifier.transform(toRunId);
export const InboxItemIdSchema = identifier.transform(toInboxItemId);
export const GrantIdSchema = identifier.transform(toGrantId);
export const ConnectionIdSchema = identifier.transform(toConnectionId);
export const ObservationIdSchema = identifier.transform(toObservationId);
export const StandardIdSchema = slug.transform(toStandardId);
export const AgentIdSchema = slug.transform(toAgentId);
export const EnvironmentIdSchema = slug.transform(toEnvironmentId);
export const CapabilityIdSchema = capabilityName.transform(toCapabilityId);
