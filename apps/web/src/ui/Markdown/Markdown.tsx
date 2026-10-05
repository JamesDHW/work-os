import type { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { markdown } from "./Markdown.css.ts";

export type MarkdownProps = {
  readonly text: string;
};

export const Markdown: FC<MarkdownProps> = ({ text }) => (
  <div className={markdown}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
  </div>
);
