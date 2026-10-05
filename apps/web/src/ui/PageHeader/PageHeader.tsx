import type { FC, ReactNode } from "react";

import { Heading, MutedText } from "../Heading/Heading.tsx";
import { pageHeader, titles } from "./PageHeader.css.ts";

export type PageHeaderProps = {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
};

export const PageHeader: FC<PageHeaderProps> = ({ title, description, actions }) => (
  <header className={pageHeader}>
    <div className={titles}>
      <Heading level="page">{title}</Heading>
      {description === undefined ? null : <MutedText>{description}</MutedText>}
    </div>
    {actions}
  </header>
);
