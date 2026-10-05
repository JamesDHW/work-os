import type { FC, InputHTMLAttributes } from "react";

import { control } from "./Field.css.ts";

export const TextInput: FC<InputHTMLAttributes<HTMLInputElement>> = ({ ...inputProps }) => <input {...inputProps} className={control} />;
