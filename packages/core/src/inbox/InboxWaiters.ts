import type { InboxItemId } from "@work-os/domain/identifiers/Identifiers";
import type { InboxItemState } from "@work-os/domain/inbox/InboxItem";

export type InboxWaiters = {
  readonly waitForClose: (inboxItemId: InboxItemId) => Promise<InboxItemState>;
  readonly settle: (inboxItemId: InboxItemId, state: InboxItemState) => void;
};
