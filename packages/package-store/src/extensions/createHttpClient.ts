import type { JsonValue } from "@work-os/domain/json/Json";
import { JsonValueSchema } from "@work-os/protocol/common/json.schema";
import { CapabilityError } from "@work-os/sdk/CapabilityError";
import type { HttpClient, HttpRequest, HttpResponse } from "@work-os/sdk/HostServices";
import { tryCatch, tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

export const createHttpClient = (): HttpClient => ({
  send: async (request) => {
    const response = await tryCatchAsync(() => fetch(request.url, toFetchInit(request)));
    if (response instanceof WorkOsError) return new CapabilityError(`Request to ${request.url} failed: ${response.message}`);

    const text = await tryCatchAsync(() => response.text());
    if (text instanceof WorkOsError) return new CapabilityError(`Could not read the response from ${request.url}.`);

    return { status: response.status, body: parseBody(text) } satisfies HttpResponse;
  },
});

const toFetchInit = (request: HttpRequest): RequestInit => {
  if (request.body === undefined) return { method: request.method, headers: request.headers };

  return { method: request.method, headers: { "content-type": "application/json", ...request.headers }, body: JSON.stringify(request.body) };
};

const parseBody = (text: string): JsonValue | string => {
  const json = tryCatch((): unknown => JSON.parse(text));
  if (json instanceof WorkOsError) return text;

  const parsed = JsonValueSchema.safeParse(json);
  return parsed.success ? parsed.data : text;
};
