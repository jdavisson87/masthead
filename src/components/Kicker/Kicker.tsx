import type { ReactNode } from 'react';
import { tv } from 'tailwind-variants';

/**
 * A kicker is the short label above a headline ("Politics", "Analysis", "Live"). It is plain text in the
 * mono face, so it is announced as ordinary content; put it before the heading in the DOM.
 */
export const kickerStyles = tv({
  base: 'm-0 font-mono text-body-xs font-medium uppercase tracking-[0.12em]',
  variants: {
    tone: {
      muted: 'text-muted',
      accent: 'text-accent',
    },
  },
  defaultVariants: { tone: 'accent' },
});

export interface KickerProps {
  children: ReactNode;
  tone?: 'muted' | 'accent';
  /** The element to render. Use "span" inside a heading or link, "div" when a paragraph is not valid. */
  as?: 'p' | 'span' | 'div';
  className?: string;
}

export function Kicker({ children, tone = 'accent', as: Tag = 'p', className }: KickerProps) {
  return <Tag className={kickerStyles({ tone, className })}>{children}</Tag>;
}
