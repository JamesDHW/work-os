import type { ChangeEvent, FC } from "react";

import { checkbox, checkboxLabel } from "./Checkbox.css.ts";

export type CheckboxProps = {
  readonly label: string;
  readonly value: string;
  readonly isChecked: boolean;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const Checkbox: FC<CheckboxProps> = (props) => (
  <label className={checkboxLabel}>
    <input className={checkbox} type="checkbox" value={props.value} checked={props.isChecked} onChange={props.onChange} />
    {props.label}
  </label>
);
