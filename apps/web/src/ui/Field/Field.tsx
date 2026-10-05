import type { FC, ReactNode } from "react";

import { field, hint, label } from "./Field.css.ts";

export type FieldProps = {
  readonly label: string;
  readonly hint?: string | undefined;
  readonly children: ReactNode;
};

export const Field: FC<FieldProps> = (props) => (
  <label className={field}>
    <span className={label}>{props.label}</span>
    {props.children}
    {props.hint === undefined ? null : <span className={hint}>{props.hint}</span>}
  </label>
);
