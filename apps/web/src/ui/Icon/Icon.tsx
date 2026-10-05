import type { FC } from "react";

import { ICON_SIZE, ICONS } from "./Icon.constants.ts";

export type IconName = keyof typeof ICONS;

export type IconProps = {
  readonly name: IconName;
};

export const Icon: FC<IconProps> = ({ name }) => {
  const TablerIcon = ICONS[name];
  return <TablerIcon size={ICON_SIZE} stroke={1.75} aria-hidden />;
};
