import type { FC, ReactNode } from "react";

import { Button } from "../../ui/Button/Button.tsx";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { NavLink } from "../NavLink/NavLink.tsx";
import { NAVIGATION } from "../shell.constants.ts";
import { brand, footer, main, shell, sidebar, workspaceName } from "./AppShell.css.ts";
import { useAppShell } from "./AppShell.hook.ts";

export type AppShellProps = {
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly children: ReactNode;
};

export const AppShell: FC<AppShellProps> = (props) => {
  const model = useAppShell(props.workspaceId);

  return (
    <div className={shell}>
      <nav className={sidebar} aria-label="Main">
        <div className={brand}>work-os</div>
        <div className={workspaceName}>{props.workspaceName}</div>
        {NAVIGATION.map((entry) => (
          <NavLink key={entry.to} workspaceId={props.workspaceId} to={entry.to} label={entry.label} icon={entry.icon} />
        ))}
        <div className={footer}>
          <Button tone="ghost" onClick={model.handleThemeClick} aria-label="Switch theme">
            <Icon name={model.themeMode === "dark" ? "sun" : "moon"} />
          </Button>
          <Button tone="ghost" onClick={model.handleSignOutClick}>
            Sign out
          </Button>
        </div>
      </nav>
      <main className={main}>{props.children}</main>
    </div>
  );
};
