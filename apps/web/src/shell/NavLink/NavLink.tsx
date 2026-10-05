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

export const NavLink: FC<NavLinkProps> = (props) => (
  <Link className={navLink} to={props.to} params={{ workspaceId: props.workspaceId }} activeOptions={{ exact: props.to === "/w/$workspaceId" }}>
    <Icon name={props.icon} />
    {props.label}
  </Link>
);
