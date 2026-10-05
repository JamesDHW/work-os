import { Link } from "@tanstack/react-router";
import type { FC } from "react";

import type { Project, Runner } from "../../api/apiTypes.ts";
import { Card } from "../../ui/Card/Card.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { StatusBadge } from "../../ui/StatusBadge/StatusBadge.tsx";
import { projectLink, projectPath } from "./ProjectCard.css.ts";

export type ProjectCardProps = {
  readonly workspaceId: string;
  readonly project: Project;
  readonly runner: Runner | undefined;
};

export const ProjectCard: FC<ProjectCardProps> = ({ workspaceId, project, runner }) => (
  <Card>
    <Stack direction="row" justify="between">
      <Link className={projectLink} to="/w/$workspaceId/p/$projectId" params={{ workspaceId, projectId: project.id }}>
        {project.name}
      </Link>
      <StatusBadge tone={runner?.isOnline === true ? "ok" : "queued"} label={runner?.name ?? "Unknown machine"} />
    </Stack>
    <span className={projectPath}>{project.location.path}</span>
    <span className={projectPath}>environment: {project.environmentId}</span>
  </Card>
);
