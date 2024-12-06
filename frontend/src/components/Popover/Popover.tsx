import * as RadixPopover from "@radix-ui/react-popover";
import clsx from "clsx";
import "./Popover.scss";
import { X } from "lucide-react";

type PopoverProps = {
  children: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
  closeButton?: boolean;
};

export const Popover = (props: PopoverProps) => (
  <RadixPopover.Root>
    {props.trigger && <RadixPopover.Trigger asChild>{props.trigger}</RadixPopover.Trigger>}
    <RadixPopover.Portal>
      <RadixPopover.Content
        align="end"
        className={clsx("Popover__content", props.className)}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {props.closeButton && (
          <RadixPopover.Close>
            <X />
          </RadixPopover.Close>
        )}
        <RadixPopover.Arrow className="Popover__arrow" />
        {props.children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  </RadixPopover.Root>
);
