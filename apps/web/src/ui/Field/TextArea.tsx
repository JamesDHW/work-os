import type { FC, TextareaHTMLAttributes } from "react";

import { multiline } from "./Field.css.ts";

export const TextArea: FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ ...textAreaProps }) => <textarea {...textAreaProps} className={multiline} />;
