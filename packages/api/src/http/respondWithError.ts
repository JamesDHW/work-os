import type { ErrorBody } from "@work-os/protocol/common/errorBody.schema";
import type { WorkOsError } from "@work-os/shared/WorkOsError";
import type { Context, TypedResponse } from "hono";

import { statusForError, type ErrorStatus } from "./statusForError.ts";

export const respondWithError = (context: Context, error: WorkOsError): Response & TypedResponse<ErrorBody, ErrorStatus, "json"> => {
  const status = statusForError(error);
  const message = status === 500 ? "Something went wrong on the server." : error.message;
  return context.json({ error: { code: error.name, message } }, status);
};
