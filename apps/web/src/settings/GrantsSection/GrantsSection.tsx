import type { FC } from "react";

import type { Grant } from "../../api/apiTypes.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { Card } from "../../ui/Card/Card.tsx";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Heading, MutedText } from "../../ui/Heading/Heading.tsx";
import { settingsList, settingsMeta, settingsRow } from "../settings.css.ts";
import { useGrantsSection } from "./GrantsSection.hook.ts";

export type GrantsSectionProps = {
  readonly workspaceId: string;
  readonly grants: readonly Grant[];
};

const describeScope = (scope: Grant["scope"]): string => (scope.kind === "run" ? `run ${scope.runId}` : `standard ${scope.standardId}`);

export const GrantsSection: FC<GrantsSectionProps> = ({ workspaceId, grants }) => {
  const model = useGrantsSection(workspaceId);

  return (
    <Card>
      <Heading level="section">Standing approvals</Heading>
      <MutedText>Approvals you gave for longer than one call. Revoke one to be asked again.</MutedText>
      {grants.length === 0 ? <EmptyState>No standing approvals.</EmptyState> : null}
      <ul className={settingsList}>
        {grants.map((grant) => (
          <li key={grant.id} className={settingsRow}>
            <span>
              <strong>{grant.capabilityId}</strong> on {grant.target} <span className={settingsMeta}>for {describeScope(grant.scope)}</span>
            </span>
            <Button tone="ghost" onClick={model.handleRevokeClick(grant.id)}>
              Revoke
            </Button>
          </li>
        ))}
      </ul>
      <ErrorNotice message={model.errorMessage} />
    </Card>
  );
};
