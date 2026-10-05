import type { HTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Loading placeholder. It is decorative (aria-hidden): mark the surrounding region with
 * aria-busy="true" and announce loading state elsewhere, such as a visually hidden status.
 * The pulse is turned off for people who prefer reduced motion.
 */
export const skeletonStyles = tv({
  base: 'animate-pulse bg-border motion-reduce:animate-none',
  variants: {
    shape: {
      text: 'h-4 w-full rounded-sm',
      block: 'h-24 w-full rounded-md',
    },
  },
  defaultVariants: { shape: 'text' },
});

export interface SkeletonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof skeletonStyles> {}

export function Skeleton({ shape, className, ...props }: SkeletonProps) {
  return <div aria-hidden="true" {...props} className={skeletonStyles({ shape, className })} />;
}
