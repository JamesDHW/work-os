import { z } from "zod";

import { ConnectionIdSchema } from "../common/identifiers.schema.ts";

export const ConnectionSchema = z
  .object({ id: ConnectionIdSchema, kind: z.string(), label: z.string(), createdAt: z.string() })
  .meta({ id: "Connection" });

export const CreateConnectionRequestSchema = z
  .object({ kind: z.string().min(1), label: z.string().min(1).max(100), secret: z.string().min(1) })
  .meta({ id: "CreateConnectionRequest" });

export const ConnectionParamsSchema = z.object({ connectionId: ConnectionIdSchema });
