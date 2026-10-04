import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { BEARER_PREFIX, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE_SECONDS } from "../http/http.constants.ts";

export const readSessionToken = (context: Context): string | undefined => {
  const authorization = context.req.header("authorization");
  if (authorization?.startsWith(BEARER_PREFIX) === true) return authorization.slice(BEARER_PREFIX.length);

  return getCookie(context, SESSION_COOKIE);
};

export const writeSessionCookie = (context: Context, token: string, isSecure: boolean): void => {
  setCookie(context, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
};

export const clearSessionCookie = (context: Context): void => {
  deleteCookie(context, SESSION_COOKIE, { path: "/" });
};
