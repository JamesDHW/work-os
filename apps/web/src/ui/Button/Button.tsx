import type { ButtonHTMLAttributes, FC } from "react";

import { buttonRecipe } from "./Button.css.ts";

export type ButtonTone = "primary" | "secondary" | "danger" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly tone?: ButtonTone;
};

export const Button: FC<ButtonProps> = ({ tone, type, ...buttonProps }) => (
  <button {...buttonProps} type={type ?? "button"} className={buttonRecipe({ tone })} />
);
