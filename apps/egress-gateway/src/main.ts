import process from "process";

import { createAllowlists } from "./allowlists.state.ts";
import { createControlServer } from "./createControlServer.ts";
import { createProxyServer } from "./createProxyServer.ts";
import { CONTROL_PORT, PROXY_PORT } from "./gateway.constants.ts";

const token = process.env["WORK_OS_EGRESS_TOKEN"] ?? "";
if (token.length === 0) {
  process.stderr.write("WORK_OS_EGRESS_TOKEN is required.\n");
  process.exit(1);
}

const allowlists = createAllowlists();
createProxyServer(allowlists).listen(PROXY_PORT, "0.0.0.0");
createControlServer(allowlists, token).listen(CONTROL_PORT, "0.0.0.0");
process.stdout.write(`work-os egress gateway: proxy :${PROXY_PORT}, control :${CONTROL_PORT}\n`);
