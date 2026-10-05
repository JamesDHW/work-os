import type { FC, ReactNode } from "react";

import { muted, pageHeading, sectionHeading } from "./Heading.css.ts";

export type HeadingProps = {
  readonly level: "page" | "section";
  readonly children: ReactNode;
};

export const Heading: FC<HeadingProps> = ({ level, children }) => {
  if (level === "page") return <h1 className={pageHeading}>{children}</h1>;

  return <h2 className={sectionHeading}>{children}</h2>;
};

export type MutedTextProps = {
  readonly children: ReactNode;
};

export const MutedText: FC<MutedTextProps> = ({ children }) => <p className={muted}>{children}</p>;
