import type { FC } from "react";

import type { InboxItem, RunSummary } from "../../api/apiTypes.ts";
import { InboxItemCard } from "../../inbox/InboxItemCard/InboxItemCard.tsx";
import { isActiveRun } from "../../runs/isActiveRun.ts";
import { RunList } from "../../runs/RunList/RunList.tsx";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { Heading } from "../../ui/Heading/Heading.tsx";
import { PageHeader } from "../../ui/PageHeader/PageHeader.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";

export type HomeScreenProps = {
  readonly workspaceId: string;
  readonly inboxItems: readonly InboxItem[];
  readonly runs: readonly RunSummary[];
};

export const HomeScreen: FC<HomeScreenProps> = ({ inboxItems, runs, workspaceId }) => {
  const blockingItems = inboxItems.filter((inboxItem) => inboxItem.status === "open" && inboxItem.isBlocking);
  const activeRuns = runs.filter(isActiveRun);

  return (
    <Stack gap="lg">
      <PageHeader title="Home" description="What needs you, and what is moving." />
      <Heading level="section">Needs you</Heading>
      {blockingItems.length === 0 ? <EmptyState>Nothing is waiting on you.</EmptyState> : null}
      {blockingItems.map((inboxItem) => (
        <InboxItemCard key={inboxItem.id} workspaceId={workspaceId} inboxItem={inboxItem} />
      ))}
      <Heading level="section">Active runs</Heading>
      <RunList workspaceId={workspaceId} runs={activeRuns} emptyText="No runs are active." />
    </Stack>
  );
};
