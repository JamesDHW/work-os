import type { paths } from "@work-os/api-types/apiSchema";
import createClient from "openapi-fetch";

export type ApiClient = ReturnType<typeof createClient<paths>>;

export const apiClient: ApiClient = createClient<paths>({ baseUrl: window.location.origin, credentials: "include" });
