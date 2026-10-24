import { createFileRoute, redirect } from "@tanstack/react-router";

import { apiClient } from "#web/api/client.ts";
import { SignInScreen } from "#web/identity/SignInScreen/SignInScreen.tsx";

const SignInRoute = () => {
  const setupStatus = Route.useLoaderData();
  return <SignInScreen isSetUp={setupStatus.isSetUp} publicOrigin={setupStatus.publicOrigin} />;
};

export const Route = createFileRoute("/signIn/")({
  loader: async () => {
    const setupStatus = await apiClient.GET("/api/setup");
    const status = setupStatus.data ?? { isSetUp: true, publicOrigin: window.location.origin, isAutoSignIn: false };
    const canAutoSignIn = status.isAutoSignIn && status.isSetUp;
    if (!canAutoSignIn) return status;

    const signedIn = await apiClient.POST("/api/dev-sign-in");
    if (!signedIn.response.ok) return status;
    // oxlint-disable-next-line architecture/no-raw-exceptions -- TanStack Router redirects from loaders by throwing the redirect.
    throw redirect({ to: "/" });
  },
  component: SignInRoute,
});
