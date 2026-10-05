import type { ChangeEvent, FC } from "react";

import { checkbox, checkboxLabel } from "./Checkbox.css.ts";

export type CheckboxProps = {
  readonly label: string;
  readonly isChecked: boolean;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const Checkbox: FC<CheckboxProps> = ({ label, isChecked, onChange }) => (
  <label className={checkboxLabel}>
    <input className={checkbox} type="checkbox" checked={isChecked} onChange={onChange} />
    {label}
  </label>
);
