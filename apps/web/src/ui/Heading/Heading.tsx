import type { FC, ReactNode } from "react";

import { muted, pageHeading, sectionHeading } from "./Heading.css.ts";

export type HeadingProps = {
  readonly level: "page" | "section";
  readonly children: ReactNode;
};

export const Heading: FC<HeadingProps> = (props) => {
  if (props.level === "page") return <h1 className={pageHeading}>{props.children}</h1>;

  return <h2 className={sectionHeading}>{props.children}</h2>;
};

export type MutedTextProps = {
  readonly children: ReactNode;
};

export const MutedText: FC<MutedTextProps> = (props) => <p className={muted}>{props.children}</p>;
