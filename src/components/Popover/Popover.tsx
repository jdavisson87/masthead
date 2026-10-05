import {
  Dialog as AriaDialog,
  DialogTrigger,
  Popover as AriaPopover,
  type DialogProps as AriaDialogProps,
  type PopoverProps as AriaPopoverProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const popoverStyles = tv({
  slots: {
    popover: [
      'rounded-lg border border-border bg-surface font-sans text-text shadow-popover',
      'data-[entering]:animate-popover-in motion-reduce:animate-none',
    ],
    dialog: 'p-4 text-sm outline-hidden',
  },
});

/**
 * Wraps a trigger and a <Popover>. React Aria wires up aria-expanded / aria-haspopup on the trigger,
 * focus management, Escape to close, and focus return.
 */
export { DialogTrigger as PopoverTrigger };

export interface PopoverProps extends Omit<AriaPopoverProps, 'className'> {
  className?: string;
}

/**
 * The floating surface. Also the base container that Select and Menu render their lists into,
 * so it carries no padding or dialog semantics of its own.
 */
export function Popover({ className, ...props }: PopoverProps) {
  const styles = popoverStyles();
  return <AriaPopover offset={8} {...props} className={styles.popover({ className })} />;
}

export interface PopoverDialogProps extends Omit<AriaDialogProps, 'className'> {
  className?: string;
}

/**
 * Dialog content for a standalone popover. It must have an accessible name: pass `aria-label`,
 * or render a React Aria <Heading slot="title"> inside.
 */
export function PopoverDialog({ className, ...props }: PopoverDialogProps) {
  const styles = popoverStyles();
  return <AriaDialog {...props} className={styles.dialog({ className })} />;
}
