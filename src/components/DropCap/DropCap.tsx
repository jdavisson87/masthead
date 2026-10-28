import type { ReactNode } from 'react';
import { tv } from 'tailwind-variants';

/**
 * An editorial drop cap. It uses the CSS ::first-letter pseudo-element, so the text stays one unbroken
 * string in the DOM: screen readers, search, and copy/paste all see the paragraph exactly as written.
 * Start the paragraph with a letter; punctuation or an element first will not enlarge as expected.
 */
export const dropCapStyles = tv({
  base: [
    'm-0 font-sans text-body-md text-text',
    'first-letter:float-left first-letter:font-serif first-letter:font-semibold first-letter:text-accent first-letter:pr-2',
  ],
  variants: {
    lines: {
      2: 'first-letter:text-[3.1em] first-letter:leading-[0.82] first-letter:mt-[0.05em]',
      3: 'first-letter:text-[4.6em] first-letter:leading-[0.78] first-letter:mt-[0.06em]',
      4: 'first-letter:text-[6.1em] first-letter:leading-[0.76] first-letter:mt-[0.07em]',
    },
  },
  defaultVariants: { lines: 3 },
});

export interface DropCapProps {
  /** The paragraph text. Its first letter becomes the drop cap. */
  children: ReactNode;
  /** How many text lines tall the initial is. */
  lines?: 2 | 3 | 4;
  as?: 'p' | 'div';
  className?: string;
}

export function DropCap({ children, lines = 3, as: Tag = 'p', className }: DropCapProps) {
  return <Tag className={dropCapStyles({ lines, className })}>{children}</Tag>;
}
