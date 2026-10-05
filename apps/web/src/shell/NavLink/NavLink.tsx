import { Link } from "@tanstack/react-router";
import type { FC } from "react";

import { Icon, type IconName } from "../../ui/Icon/Icon.tsx";
import type { NavigationTarget } from "../shell.constants.ts";
import { navLink } from "./NavLink.css.ts";

export type NavLinkProps = {
  readonly workspaceId: string;
  readonly to: NavigationTarget;
  readonly label: string;
  readonly icon: IconName;
};

export const NavLink: FC<NavLinkProps> = ({ to, workspaceId, icon, label }) => (
  <Link className={navLink} to={to} params={{ workspaceId: workspaceId }} activeOptions={{ exact: to === "/w/$workspaceId" }}>
    <Icon name={icon} />
    {label}
  </Link>
);
