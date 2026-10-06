import {
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  type TooltipProps as AriaTooltipProps,
  type TooltipTriggerComponentProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * Inverted surface (text color as background) so it stands out in both themes.
 * A tooltip only supplements a control: never put essential information in one.
 */
export const tooltipStyles = tv({
  base: 'max-w-xs rounded-md bg-text px-2 py-1 font-sans text-xs font-medium text-bg shadow-popover data-[entering]:animate-fade-in motion-reduce:animate-none',
});

export type TooltipTriggerProps = TooltipTriggerComponentProps;

/**
 * Wraps a focusable trigger and a <Tooltip>. Shows on hover and on keyboard focus,
 * hides on Escape, and links to the trigger with aria-describedby.
 * React Aria's default hover delay is 1500ms; this defaults to 500ms.
 */
export function TooltipTrigger({ delay = 500, ...props }: TooltipTriggerProps) {
  return <AriaTooltipTrigger delay={delay} {...props} />;
}

export interface TooltipProps extends Omit<AriaTooltipProps, 'className'> {
  className?: string;
}

export function Tooltip({ className, placement = 'top', offset = 6, ...props }: TooltipProps) {
  return <AriaTooltip {...props} placement={placement} offset={offset} className={tooltipStyles({ className })} />;
}
