import { Content, Overlay, Portal, Root, Title, Trigger } from "@radix-ui/react-dialog";
import type { FC, ReactNode } from "react";

import { content, overlay, title } from "./Dialog.css.ts";

export type DialogProps = {
  readonly title: string;
  readonly trigger: ReactNode;
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly children: ReactNode;
};

export const Dialog: FC<DialogProps> = (props) => (
  <Root open={props.isOpen} onOpenChange={props.onOpenChange}>
    <Trigger asChild>{props.trigger}</Trigger>
    <Portal>
      <Overlay className={overlay} />
      <Content className={content} aria-describedby={undefined}>
        <Title className={title}>{props.title}</Title>
        {props.children}
      </Content>
    </Portal>
  </Root>
);
