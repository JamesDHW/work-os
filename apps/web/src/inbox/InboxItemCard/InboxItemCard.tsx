import { Link } from "@tanstack/react-router";
import type { FC } from "react";

import type { InboxItem } from "../../api/apiTypes.ts";
import { Card } from "../../ui/Card/Card.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { StatusBadge } from "../../ui/StatusBadge/StatusBadge.tsx";
import { AnswerForm } from "../AnswerForm/AnswerForm.tsx";
import { KIND_LABELS } from "../inbox.constants.ts";
import { meta, title } from "./InboxItemCard.css.ts";

export type InboxItemCardProps = {
  readonly workspaceId: string;
  readonly inboxItem: InboxItem;
};

export const InboxItemCard: FC<InboxItemCardProps> = ({ workspaceId, inboxItem }) => (
  <Card>
    <Stack direction="row" justify="between">
      <Stack direction="row" gap="sm">
        <StatusBadge tone={inboxItem.isBlocking ? "review" : "queued"} label={KIND_LABELS[inboxItem.payload.kind]} />
        <span className={title}>{inboxItem.title}</span>
      </Stack>
      <span className={meta}>{new Date(inboxItem.createdAt).toLocaleString()}</span>
    </Stack>
    {inboxItem.runId === null ? null : (
      <Link className={meta} to="/w/$workspaceId/runs/$runId" params={{ workspaceId, runId: inboxItem.runId }}>
        Open the run
      </Link>
    )}
    {inboxItem.status === "open" ? <AnswerForm workspaceId={workspaceId} inboxItem={inboxItem} /> : <span className={meta}>{inboxItem.status}</span>}
  </Card>
);
