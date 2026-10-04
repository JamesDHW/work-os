import type { Context } from "hono";

type ValidationResult = {
  readonly success: boolean;
  readonly error?: { readonly issues: readonly { readonly path: readonly PropertyKey[]; readonly message: string }[] };
};

export const rejectInvalidRequest = (result: ValidationResult, context: Context): Response | undefined => {
  if (result.success) return undefined;

  const issues = result.error?.issues ?? [];
  const message = issues.map((issue) => `${issue.path.map(String).join(".")}: ${issue.message}`).join("; ");
  return context.json({ error: { code: "InvalidRequestError", message: `The request is invalid. ${message}` } }, 400);
};
