import type { SSEStreamingApi } from "hono/streaming";

export const writeEvent = async (stream: SSEStreamingApi, name: string, payload: object): Promise<void> => {
  // oxlint-disable-next-line eslint/id-denylist -- Hono's server-sent event message names its payload field data.
  return stream.writeSSE({ event: name, data: JSON.stringify(payload) });
};
