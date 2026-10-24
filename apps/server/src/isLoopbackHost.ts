import { LOOPBACK_HOSTS } from "./server.constants.ts";

/** Automatic sign-in is only offered by a server nothing but this machine can reach. */
export const isLoopbackHost = (host: string): boolean => LOOPBACK_HOSTS.includes(host);
