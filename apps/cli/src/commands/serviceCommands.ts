import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { CliContext } from "../CliContext.ts";
import { ACTION_PAST_TENSE, SERVICE_NAMES } from "../cli.constants.ts";
import type { ServiceName } from "../services/ServiceDefinition.ts";
import { writeLine } from "../writeLine.ts";

type ServiceAction = "start" | "stop" | "restart";

/** The services a command names: one of them, or both when none is named. */
export const selectedServices = (context: CliContext): readonly ServiceName[] | WorkOsError => {
  const [name] = context.commandLine.positionals;
  if (name === undefined) return SERVICE_NAMES;

  const selected = SERVICE_NAMES.find((candidate) => candidate === name);
  if (selected === undefined) return new WorkOsError(`Unknown service "${name}". Use server or runner.`);
  return [selected];
};

export const runServiceAction = async (context: CliContext, action: ServiceAction): Promise<WorkOsError | undefined> => {
  const names = selectedServices(context);
  if (names instanceof WorkOsError) return names;

  for (const name of names) {
    const outcome = await applyAction(context, action, name);
    if (outcome instanceof WorkOsError) return outcome;
  }
  return undefined;
};

const applyAction = async (context: CliContext, action: ServiceAction, name: ServiceName): Promise<WorkOsError | undefined> => {
  const service = { profile: context.paths.profile, name };
  const status = await context.services.status(service);
  if (status instanceof WorkOsError) return status;
  const isMissing = status.state === "notInstalled" && action !== "stop";
  if (isMissing) {
    return new WorkOsError(`The ${name} service is not installed for profile "${context.paths.profile}". Run: work-os setup --profile ${context.paths.profile}`);
  }

  const applied = await (action === "stop" ? context.services.stop(service) : context.services.start(service));
  if (applied instanceof WorkOsError) return applied;

  writeLine(`${ACTION_PAST_TENSE[action]} ${name} (${context.paths.profile}).`);
  return undefined;
};
