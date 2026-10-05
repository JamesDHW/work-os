import { createFileRoute } from "@tanstack/react-router";

import { apiClient } from "#web/api/client.ts";
import { SignInScreen } from "#web/identity/SignInScreen/SignInScreen.tsx";

const SignInRoute = () => <SignInScreen isSetUp={Route.useLoaderData()} />;

export const Route = createFileRoute("/signIn/")({
  loader: async () => {
    const setupStatus = await apiClient.GET("/api/setup");
    return setupStatus.data?.isSetUp ?? true;
  },
  component: SignInRoute,
});
