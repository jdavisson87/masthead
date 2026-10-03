import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * React Aria exposes interaction state as data attributes
 * (data-hovered, data-pressed, data-focus-visible, data-disabled),
 * so styling hooks onto those instead of :hover / :focus.
 */
export const buttonStyles = tv({
  base: [
    'inline-flex items-center justify-center gap-2 rounded-md border font-sans font-medium',
    'cursor-default select-none transition-colors',
    'outline-hidden data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-accent',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  ],
  variants: {
    intent: {
      primary:
        'border-accent bg-accent text-accent-fg data-[hovered]:border-accent-hover data-[hovered]:bg-accent-hover data-[pressed]:bg-accent-hover',
      secondary:
        'border-border-strong bg-surface text-text data-[hovered]:bg-raised data-[pressed]:bg-raised',
      ghost:
        'border-transparent bg-transparent text-text data-[hovered]:bg-raised data-[pressed]:bg-raised',
      danger:
        'border-danger bg-transparent text-danger data-[hovered]:bg-raised data-[pressed]:bg-raised',
    },
    size: {
      sm: 'h-8 px-3 text-[13px]',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});

export interface ButtonProps
  extends Omit<AriaButtonProps, 'className'>,
    VariantProps<typeof buttonStyles> {
  className?: string;
}

export function Button({ intent, size, className, ...props }: ButtonProps) {
  return <AriaButton {...props} className={buttonStyles({ intent, size, className })} />;
}
