import { createRootRoute, Outlet } from "@tanstack/react-router";

import "#web/ui/globalStyles.css.ts";

export const Route = createRootRoute({ component: Outlet });
