import { z } from "zod";

import { RunIdSchema } from "../common/identifiers.schema.ts";

export const ServerEventSchema = z
  .discriminatedUnion("kind", [
    z.object({ kind: z.literal("runUpdated"), runId: RunIdSchema }),
    z.object({ kind: z.literal("inboxUpdated") }),
    z.object({ kind: z.literal("runnersUpdated") }),
    z.object({ kind: z.literal("projectsUpdated") }),
    z.object({ kind: z.literal("catalogueUpdated") }),
  ])
  .meta({ id: "ServerEvent" });
