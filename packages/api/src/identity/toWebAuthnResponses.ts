import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import type { AuthenticationResponseSchema, RegistrationResponseSchema } from "@work-os/protocol/api/identity.schema";
import type { z } from "@hono/zod-openapi";

type RegistrationBody = z.output<typeof RegistrationResponseSchema>;
type AuthenticationBody = z.output<typeof AuthenticationResponseSchema>;

export const toRegistrationResponse = (body: RegistrationBody): RegistrationResponseJSON => {
  const { authenticatorData, transports, publicKeyAlgorithm, publicKey, ...required } = body.response;
  return {
    id: body.id,
    rawId: body.rawId,
    type: body.type,
    clientExtensionResults: {},
    ...attachmentOf(body.authenticatorAttachment),
    response: {
      ...required,
      ...(authenticatorData === undefined ? {} : { authenticatorData }),
      ...(transports === undefined ? {} : { transports }),
      ...(publicKeyAlgorithm === undefined ? {} : { publicKeyAlgorithm }),
      ...(publicKey === undefined ? {} : { publicKey }),
    },
  };
};

export const toAuthenticationResponse = (body: AuthenticationBody): AuthenticationResponseJSON => {
  const { userHandle, ...required } = body.response;
  return {
    id: body.id,
    rawId: body.rawId,
    type: body.type,
    clientExtensionResults: {},
    ...attachmentOf(body.authenticatorAttachment),
    response: { ...required, ...(userHandle === undefined ? {} : { userHandle }) },
  };
};

const attachmentOf = (attachment: RegistrationBody["authenticatorAttachment"]) => (attachment === undefined ? {} : { authenticatorAttachment: attachment });

