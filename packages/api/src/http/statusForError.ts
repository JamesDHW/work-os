import { ConflictError } from "@work-os/shared/ConflictError";
import { ForbiddenError } from "@work-os/shared/ForbiddenError";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { UnauthenticatedError } from "@work-os/shared/UnauthenticatedError";
import { UnavailableError } from "@work-os/shared/UnavailableError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 500 | 503;

export const statusForError = (error: WorkOsError): ErrorStatus => {
  if (error instanceof InvalidRequestError) return 400;
  if (error instanceof UnauthenticatedError) return 401;
  if (error instanceof ForbiddenError) return 403;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ConflictError) return 409;
  if (error instanceof UnavailableError) return 503;

  return 500;
};
