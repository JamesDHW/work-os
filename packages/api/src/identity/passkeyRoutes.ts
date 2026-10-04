import { createRoute, type OpenAPIHono } from "@hono/zod-openapi";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type { Passkey } from "@work-os/core/identity/PasskeyStore";
import {
  OkResponseSchema,
  PasskeyOptionsResponseSchema,
  PasskeyRegistrationRequestSchema,
  PasskeySignInRequestSchema,
} from "@work-os/protocol/api/identity.schema";
import { UnauthenticatedError } from "@work-os/shared/UnauthenticatedError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { errorResponses, jsonBody, jsonResponse } from "../http/errorResponses.ts";
import { respondWithError } from "../http/respondWithError.ts";
import { createRequireUser } from "../middleware/requireUser.ts";
import { createChallengeStore } from "./createChallengeStore.ts";
import { writeSessionCookie } from "./sessionCookie.ts";
import { toOpaqueJson } from "../http/toOpaqueJson.ts";

export const registerPasskeyRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  const requireUser = createRequireUser(services);
  const challenges = createChallengeStore(() => Date.parse(services.clock.now()));
  const { settings } = services;

  const registrationOptionsRoute = createRoute({
    method: "post",
    path: "/api/passkeys/registration-options",
    middleware: [requireUser] as const,
    responses: { 200: jsonResponse(PasskeyOptionsResponseSchema, "Options for navigator.credentials.create."), ...errorResponses },
  });
  app.openapi(registrationOptionsRoute, async (context) => {
    const user = context.get("user");
    const existing = await services.identity.passkeyStore.listPasskeysForUser(user.id);
    if (existing instanceof WorkOsError) return respondWithError(context, existing);

    const options = await tryCatchAsync(() =>
      generateRegistrationOptions({
        rpName: settings.relyingPartyName,
        rpID: settings.relyingPartyId,
        userName: user.displayName,
        userID: new TextEncoder().encode(user.id),
        attestationType: "none",
        excludeCredentials: existing.map((passkey) => ({ id: passkey.credentialId })),
        authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
      }),
    );
    if (options instanceof WorkOsError) return respondWithError(context, options);

    challenges.remember(options.challenge, user.id);
    return context.json({ options: toOpaqueJson(options) }, 200);
  });

  const registrationRoute = createRoute({
    method: "post",
    path: "/api/passkeys",
    middleware: [requireUser] as const,
    request: jsonBody(PasskeyRegistrationRequestSchema),
    responses: { 200: jsonResponse(OkResponseSchema, "The passkey is registered."), ...errorResponses },
  });
  app.openapi(registrationRoute, async (context) => {
    const user = context.get("user");
    const verification = await tryCatchAsync(() =>
      verifyRegistrationResponse({
        response: context.req.valid("json").response,
        expectedChallenge: (challenge) => challenges.consume(challenge)?.userId === user.id,
        expectedOrigin: settings.publicOrigin,
        expectedRPID: settings.relyingPartyId,
      }),
    );
    if (verification instanceof WorkOsError) return respondWithError(context, new UnauthenticatedError(verification.message));
    if (!verification.verified) return respondWithError(context, new UnauthenticatedError("The passkey could not be verified."));

    const { credential } = verification.registrationInfo;
    const registered = await services.identity.registerPasskey({
      userId: user.id,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      transports: credential.transports ?? [],
    });
    if (registered instanceof WorkOsError) return respondWithError(context, registered);
    return context.json({ ok: true } as const, 200);
  });

  const signInOptionsRoute = createRoute({
    method: "post",
    path: "/api/passkeys/sign-in-options",
    responses: { 200: jsonResponse(PasskeyOptionsResponseSchema, "Options for navigator.credentials.get."), ...errorResponses },
  });
  app.openapi(signInOptionsRoute, async (context) => {
    const options = await tryCatchAsync(() => generateAuthenticationOptions({ rpID: settings.relyingPartyId, userVerification: "preferred" }));
    if (options instanceof WorkOsError) return respondWithError(context, options);

    challenges.remember(options.challenge, null);
    return context.json({ options: toOpaqueJson(options) }, 200);
  });

  const signInRoute = createRoute({
    method: "post",
    path: "/api/passkeys/sign-in",
    request: jsonBody(PasskeySignInRequestSchema),
    responses: { 200: jsonResponse(OkResponseSchema, "Signed in."), ...errorResponses },
  });
  app.openapi(signInRoute, async (context) => {
    const { response } = context.req.valid("json");
    const verifyAssertion = async (passkey: Passkey): Promise<number | WorkOsError> => {
      const verification = await tryCatchAsync(() =>
        verifyAuthenticationResponse({
          response,
          expectedChallenge: (challenge) => challenges.consume(challenge) !== undefined,
          expectedOrigin: settings.publicOrigin,
          expectedRPID: settings.relyingPartyId,
          credential: { id: passkey.credentialId, publicKey: Buffer.from(passkey.publicKey, "base64url"), counter: passkey.counter },
        }),
      );
      if (verification instanceof WorkOsError) return verification;
      if (!verification.verified) return new UnauthenticatedError("The passkey could not be verified.");
      return verification.authenticationInfo.newCounter;
    };

    const token = await services.identity.signInWithPasskey({ credentialId: response.id, verifyAssertion });
    if (token instanceof WorkOsError) return respondWithError(context, token);

    writeSessionCookie(context, token, settings.isSecureCookie);
    return context.json({ ok: true } as const, 200);
  });
};
