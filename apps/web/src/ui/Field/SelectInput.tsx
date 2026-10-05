import type { FC, SelectHTMLAttributes } from "react";

import { control } from "./Field.css.ts";

export const SelectInput: FC<SelectHTMLAttributes<HTMLSelectElement>> = ({ ...selectProps }) => <select {...selectProps} className={control} />;
