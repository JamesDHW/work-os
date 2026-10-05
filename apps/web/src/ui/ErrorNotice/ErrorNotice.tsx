import type { FC } from "react";

import { errorNotice } from "./ErrorNotice.css.ts";

export type ErrorNoticeProps = {
  readonly message: string | null;
};

export const ErrorNotice: FC<ErrorNoticeProps> = (props) => {
  if (props.message === null) return null;

  return (
    <p role="alert" className={errorNotice}>
      {props.message}
    </p>
  );
};
