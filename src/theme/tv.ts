import { createTV } from 'tailwind-variants';

/**
 * Masthead's `tv`. Use it instead of importing `tv` from 'tailwind-variants'.
 *
 * tailwind-variants runs every class list through tailwind-merge, which only knows Tailwind's built-in
 * names. Left alone, it reads our type-scale sizes (`text-body-md`) as text colors, so a slot with both a
 * size and a color loses one of them, and it cannot tell that `p-sm` should override `p-lg`.
 * Registering the custom theme names here fixes both.
 *
 * Keep these lists in sync with the tokens in styles.css and theme/scale.css; tv.test.ts fails if they drift.
 */
export const customThemeNames = {
  /** --text-* in scale.css: font sizes. */
  text: [
    'heading-xs',
    'heading-sm',
    'heading-md',
    'heading-lg',
    'heading-xl',
    'body-xs',
    'body-sm',
    'body-md',
    'body-lg',
    'body-xl',
  ],
  /** --spacing-* in scale.css: padding, margin, gap, inset, and size utilities. */
  spacing: ['xs', 'sm', 'md', 'lg', 'xl'],
  /** --tracking-* in scale.css. */
  tracking: ['heading-tight', 'heading-snug'],
  /** --shadow-* in styles.css. */
  shadow: ['popover'],
  /** --animate-* in styles.css. */
  animate: ['popover-in', 'fade-in', 'dialog-in', 'progress-indeterminate', 'ticker'],
};

export const tv = createTV({ twMergeConfig: { extend: { theme: customThemeNames } } });

export type { VariantProps } from 'tailwind-variants';
