import type { FC } from "react";

import type { InboxItem } from "../../api/apiTypes.ts";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { Heading } from "../../ui/Heading/Heading.tsx";
import { PageHeader } from "../../ui/PageHeader/PageHeader.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { InboxItemCard } from "../InboxItemCard/InboxItemCard.tsx";

export type InboxScreenProps = {
  readonly workspaceId: string;
  readonly inboxItems: readonly InboxItem[];
};

export const InboxScreen: FC<InboxScreenProps> = ({ inboxItems, workspaceId }) => {
  const openItems = inboxItems.filter((inboxItem) => inboxItem.status === "open");
  const closedItems = inboxItems.filter((inboxItem) => inboxItem.status !== "open");

  return (
    <Stack gap="lg">
      <PageHeader title="Inbox" description="Questions, approvals and reviews from your runs. Blocking items come first." />
      {openItems.length === 0 ? <EmptyState>Nothing needs you right now.</EmptyState> : null}
      {openItems.map((inboxItem) => (
        <InboxItemCard key={inboxItem.id} workspaceId={workspaceId} inboxItem={inboxItem} />
      ))}
      {closedItems.length > 0 ? <Heading level="section">Recently handled</Heading> : null}
      {closedItems.slice(0, 20).map((inboxItem) => (
        <InboxItemCard key={inboxItem.id} workspaceId={workspaceId} inboxItem={inboxItem} />
      ))}
    </Stack>
  );
};
