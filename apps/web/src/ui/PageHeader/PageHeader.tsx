import type { FC, ReactNode } from "react";

import { Heading, MutedText } from "../Heading/Heading.tsx";
import { pageHeader, titles } from "./PageHeader.css.ts";

export type PageHeaderProps = {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
};

export const PageHeader: FC<PageHeaderProps> = (props) => (
  <header className={pageHeader}>
    <div className={titles}>
      <Heading level="page">{props.title}</Heading>
      {props.description === undefined ? null : <MutedText>{props.description}</MutedText>}
    </div>
    {props.actions}
  </header>
);
