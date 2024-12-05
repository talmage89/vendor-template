import * as RadixPopover from "@radix-ui/react-popover";

type PopoverProps = {
  children: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
};

export const Popover = (props: PopoverProps) => (
  <RadixPopover.Root>
    {props.trigger && <RadixPopover.Trigger asChild>{props.trigger}</RadixPopover.Trigger>}
    <RadixPopover.Anchor />
    <RadixPopover.Portal>
      <RadixPopover.Content className={props.className}>
        <RadixPopover.Close />
        <RadixPopover.Arrow />
        {props.children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  </RadixPopover.Root>
);
