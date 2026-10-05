import type { FC, ReactNode } from "react";

import { card } from "./Card.css.ts";

export type CardProps = {
  readonly children: ReactNode;
};

export const Card: FC<CardProps> = ({ children }) => <section className={card}>{children}</section>;
