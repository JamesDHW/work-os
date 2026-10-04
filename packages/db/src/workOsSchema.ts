import { capabilityCalls } from "./tables/capabilityCalls.ts";
import { connections } from "./tables/connections.ts";
import { grants } from "./tables/grants.ts";
import { inboxItems } from "./tables/inboxItems.ts";
import { memberships } from "./tables/memberships.ts";
import { observations } from "./tables/observations.ts";
import { passkeys } from "./tables/passkeys.ts";
import { projects } from "./tables/projects.ts";
import { pushSubscriptions } from "./tables/pushSubscriptions.ts";
import { runners } from "./tables/runners.ts";
import { runs } from "./tables/runs.ts";
import { sessions } from "./tables/sessions.ts";
import { settings } from "./tables/settings.ts";
import { users } from "./tables/users.ts";
import { workspaces } from "./tables/workspaces.ts";

export const workOsSchema = {
  users,
  sessions,
  passkeys,
  workspaces,
  memberships,
  runners,
  projects,
  runs,
  inboxItems,
  grants,
  capabilityCalls,
  connections,
  pushSubscriptions,
  observations,
  settings,
};
