import type { HTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Small status label: JetBrains Mono, 12px, uppercase. Text colors all meet
 * AA (4.5:1) on the `raised` surface in both themes.
 */
export const badgeStyles = tv({
  base: 'inline-flex items-center rounded-sm border bg-raised px-1.5 py-0.5 font-mono text-xs font-medium uppercase tracking-wider',
  variants: {
    tone: {
      neutral: 'border-border text-muted',
      accent: 'border-accent text-accent',
      success: 'border-success text-success',
      danger: 'border-danger text-danger',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeStyles> {}

export function Badge({ tone, className, ...props }: BadgeProps) {
  return <span {...props} className={badgeStyles({ tone, className })} />;
}
