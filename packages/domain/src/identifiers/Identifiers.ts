import { brandString, type Branded } from "./Branded.ts";

export type UserId = Branded<string, "UserId">;
export type WorkspaceId = Branded<string, "WorkspaceId">;
export type ProjectId = Branded<string, "ProjectId">;
export type RunnerId = Branded<string, "RunnerId">;
export type RunId = Branded<string, "RunId">;
export type InboxItemId = Branded<string, "InboxItemId">;
export type GrantId = Branded<string, "GrantId">;
export type ConnectionId = Branded<string, "ConnectionId">;
export type ObservationId = Branded<string, "ObservationId">;
export type StandardId = Branded<string, "StandardId">;
export type AgentId = Branded<string, "AgentId">;
export type EnvironmentId = Branded<string, "EnvironmentId">;
export type CapabilityId = Branded<string, "CapabilityId">;

export const toUserId = (value: string): UserId => brandString<"UserId">(value);
export const toWorkspaceId = (value: string): WorkspaceId => brandString<"WorkspaceId">(value);
export const toProjectId = (value: string): ProjectId => brandString<"ProjectId">(value);
export const toRunnerId = (value: string): RunnerId => brandString<"RunnerId">(value);
export const toRunId = (value: string): RunId => brandString<"RunId">(value);
export const toInboxItemId = (value: string): InboxItemId => brandString<"InboxItemId">(value);
export const toGrantId = (value: string): GrantId => brandString<"GrantId">(value);
export const toConnectionId = (value: string): ConnectionId => brandString<"ConnectionId">(value);
export const toObservationId = (value: string): ObservationId => brandString<"ObservationId">(value);
export const toStandardId = (value: string): StandardId => brandString<"StandardId">(value);
export const toAgentId = (value: string): AgentId => brandString<"AgentId">(value);
export const toEnvironmentId = (value: string): EnvironmentId => brandString<"EnvironmentId">(value);
export const toCapabilityId = (value: string): CapabilityId => brandString<"CapabilityId">(value);
