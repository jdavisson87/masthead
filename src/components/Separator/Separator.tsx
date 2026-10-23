import { Separator as AriaSeparator, type SeparatorProps as AriaSeparatorProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * A rule between content. It is drawn with a background fill, not a border, so the same element works
 * horizontally and vertically. `border-0 m-0` resets the browser's default <hr> look, because Masthead
 * ships no CSS reset. Weight 2px + `ink` tone gives the editorial masthead rule.
 */
export const separatorStyles = tv({
  base: 'm-0 shrink-0 border-0',
  variants: {
    orientation: {
      horizontal: 'w-full',
      vertical: 'self-stretch',
    },
    tone: {
      /** The quiet default. */
      subtle: 'bg-border',
      /** Matches control boundaries; use where a divider must stay clearly visible. */
      strong: 'bg-border-strong',
      /** Full text color, for headings and section breaks. */
      ink: 'bg-text',
    },
    weight: {
      thin: '',
      thick: '',
    },
  },
  compoundVariants: [
    { orientation: 'horizontal', weight: 'thin', class: 'h-px' },
    { orientation: 'horizontal', weight: 'thick', class: 'h-0.5' },
    { orientation: 'vertical', weight: 'thin', class: 'w-px' },
    { orientation: 'vertical', weight: 'thick', class: 'w-0.5' },
  ],
  defaultVariants: { orientation: 'horizontal', tone: 'subtle', weight: 'thin' },
});

export interface SeparatorProps extends Omit<AriaSeparatorProps, 'className' | 'style' | 'elementType'> {
  tone?: 'subtle' | 'strong' | 'ink';
  /** `thick` is 2px; pair it with `tone="ink"` for a masthead rule. */
  weight?: 'thin' | 'thick';
  /**
   * Purely visual. Hides the rule from assistive tech instead of announcing "separator".
   * Use it for decoration between things that are already clearly separate (such as items in a toolbar);
   * leave it off when the rule marks a real change of topic.
   */
  decorative?: boolean;
  className?: string;
}

export function Separator({
  orientation = 'horizontal',
  tone = 'subtle',
  weight = 'thin',
  decorative = false,
  className,
  ...props
}: SeparatorProps) {
  const classes = separatorStyles({ orientation, tone, weight, className });

  if (decorative) {
    return <div role="none" className={classes} />;
  }
  return <AriaSeparator {...props} orientation={orientation} className={classes} />;
}
