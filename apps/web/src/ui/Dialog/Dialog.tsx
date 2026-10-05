import { Content, Overlay, Portal, Root, Title, Trigger } from "@radix-ui/react-dialog";
import type { FC, ReactNode } from "react";

import { content, dialogTitle, overlay } from "./Dialog.css.ts";

export type DialogProps = {
  readonly title: string;
  readonly trigger: ReactNode;
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly children: ReactNode;
};

export const Dialog: FC<DialogProps> = ({ isOpen, onOpenChange, trigger, title, children }) => (
  <Root open={isOpen} onOpenChange={onOpenChange}>
    <Trigger asChild>{trigger}</Trigger>
    <Portal>
      <Overlay className={overlay} />
      <Content className={content} aria-describedby={undefined}>
        <Title className={dialogTitle}>{title}</Title>
        {children}
      </Content>
    </Portal>
  </Root>
);
