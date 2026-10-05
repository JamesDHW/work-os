import { LAUNCH_AGENT_PREFIX } from "../cli.constants.ts";
import type { ServiceDefinition } from "./ServiceDefinition.ts";

const escapeXml = (text: string): string => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const xmlString = (text: string): string => `<string>${escapeXml(text)}</string>`;

export const launchAgentLabel = (service: ServiceDefinition): string => `${LAUNCH_AGENT_PREFIX}.${service.name}`;

// A macOS LaunchAgent that starts the service at login and restarts it if it exits.
export const renderLaunchAgent = (service: ServiceDefinition): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    "<dict>",
    `  <key>Label</key>${xmlString(launchAgentLabel(service))}`,
    "  <key>ProgramArguments</key>",
    "  <array>",
    ...service.programArguments.map((programArgument) => `    ${xmlString(programArgument)}`),
    "  </array>",
    `  <key>WorkingDirectory</key>${xmlString(service.workingDirectory)}`,
    `  <key>EnvironmentVariables</key><dict><key>PATH</key>${xmlString(service.searchPath)}</dict>`,
    "  <key>RunAtLoad</key><true/>",
    "  <key>KeepAlive</key><true/>",
    `  <key>StandardOutPath</key>${xmlString(service.logPath)}`,
    `  <key>StandardErrorPath</key>${xmlString(service.logPath)}`,
    "</dict>",
    "</plist>",
    "",
  ].join("\n");
