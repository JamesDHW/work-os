export const CREDENTIALS_FILE = "credentials.json";
export const CREDENTIALS_FILE_MODE = 0o600;
export const RECONNECT_DELAYS_MILLISECONDS: readonly number[] = [1000, 2000, 5000, 10_000, 30_000];
export const EGRESS_POLL_MILLISECONDS = 5000;
export const DEFAULT_GATEWAY_CONTROL_PORT = 3129;
export const LINK_PATH = "/api/runners/link";
export const UNAUTHORIZED_CLOSE_CODE = 4401;
