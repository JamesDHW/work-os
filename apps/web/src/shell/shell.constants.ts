export const SERVER_EVENT_NAMES: readonly string[] = ["runUpdated", "inboxUpdated", "runnersUpdated", "projectsUpdated", "catalogueUpdated"];

export const NAVIGATION = [
  { label: "Home", to: "/w/$workspaceId", icon: "home" },
  { label: "Inbox", to: "/w/$workspaceId/inbox", icon: "inbox" },
  { label: "Runs", to: "/w/$workspaceId/runs", icon: "play" },
  { label: "Projects", to: "/w/$workspaceId/projects", icon: "folder" },
  { label: "Standards", to: "/w/$workspaceId/standards", icon: "standard" },
  { label: "Settings", to: "/w/$workspaceId/settings", icon: "settings" },
] as const;

export type NavigationTarget = (typeof NAVIGATION)[number]["to"];
