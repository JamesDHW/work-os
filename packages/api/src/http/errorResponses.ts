import { ErrorBodySchema } from "@work-os/protocol/common/errorBody.schema";

export type JsonResponse<Schema> = {
  readonly content: { readonly "application/json": { readonly schema: Schema } };
  readonly description: string;
};

const errorResponse = (description: string): JsonResponse<typeof ErrorBodySchema> => ({
  content: { "application/json": { schema: ErrorBodySchema } },
  description,
});

export const errorResponses = {
  400: errorResponse("The request is invalid."),
  401: errorResponse("Sign in first."),
  403: errorResponse("Not allowed."),
  404: errorResponse("Not found."),
  409: errorResponse("The request conflicts with the current state."),
  500: errorResponse("Unexpected server error."),
  503: errorResponse("A machine or service is unavailable."),
};

export const jsonResponse = <Schema>(schema: Schema, description: string): JsonResponse<Schema> => ({
  content: { "application/json": { schema } },
  description,
});

export type JsonBody<Schema> = {
  readonly body: { readonly content: { readonly "application/json": { readonly schema: Schema } }; readonly required: true };
};

export const jsonBody = <Schema>(schema: Schema): JsonBody<Schema> => ({
  body: { content: { "application/json": { schema } }, required: true },
});
