import type { FC, ReactNode } from "react";

import { field, fieldHint, fieldLabel } from "./Field.css.ts";

export type FieldProps = {
  readonly label: string;
  readonly hint?: string | undefined;
  readonly children: ReactNode;
};

export const Field: FC<FieldProps> = ({ label, children, hint }) => (
  <label className={field}>
    <span className={fieldLabel}>{label}</span>
    {children}
    {hint === undefined ? null : <span className={fieldHint}>{hint}</span>}
  </label>
);
