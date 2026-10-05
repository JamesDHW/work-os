import { Link } from "@tanstack/react-router";
import type { FC } from "react";

import type { Standard } from "../../api/apiTypes.ts";
import { Card } from "../../ui/Card/Card.tsx";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { MutedText } from "../../ui/Heading/Heading.tsx";
import { PageHeader } from "../../ui/PageHeader/PageHeader.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { standardLink, standardMeta } from "./StandardsScreen.css.ts";

export type StandardsScreenProps = {
  readonly workspaceId: string;
  readonly standards: readonly Standard[];
};

export const StandardsScreen: FC<StandardsScreenProps> = (props) => (
  <Stack gap="lg">
    <PageHeader title="Standards" description="Each kind of work, its criteria, its agent and what it may do." />
    {props.standards.length === 0 ? <EmptyState>No standards are installed.</EmptyState> : null}
    {props.standards.map((standard) => (
      <Card key={standard.id}>
        <Link className={standardLink} to="/w/$workspaceId/standards/$standardId" params={{ workspaceId: props.workspaceId, standardId: standard.id }}>
          {standard.id}
        </Link>
        <MutedText>{standard.describes}</MutedText>
        <span className={standardMeta}>
          agent {standard.agentId} · review {standard.review} · {standard.checks.length} checks · {standard.capabilities.length} capabilities
        </span>
      </Card>
    ))}
  </Stack>
);
