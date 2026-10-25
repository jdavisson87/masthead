import { ProgressBar as AriaProgressBar } from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * An indeterminate loading indicator. Built on React Aria's ProgressBar so it is exposed as a named
 * `progressbar` with no value, which is what assistive tech expects for "busy, no estimate".
 * Square line ends keep it in the sharp, editorial family. With reduced motion it stops spinning and
 * stays a static three-quarter ring; the accessible name (and optional visible label) still say what is happening.
 */
export const spinnerStyles = tv({
  slots: {
    root: 'inline-flex items-center gap-2 font-sans text-sm text-muted',
    icon: 'shrink-0 animate-spin motion-reduce:animate-none',
  },
  variants: {
    size: {
      xs: { icon: 'size-3.5' },
      sm: { icon: 'size-4' },
      md: { icon: 'size-6' },
      lg: { icon: 'size-10' },
    },
    tone: {
      accent: { icon: 'text-accent' },
      muted: { icon: 'text-muted' },
      /** Inherit the surrounding text color, for use inside a Button. */
      current: { icon: 'text-current' },
    },
  },
  defaultVariants: { size: 'md', tone: 'accent' },
});

function Ring({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" focusable="false" className={className}>
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      {/* Circumference is about 56.5, so 42 + 14.5 leaves a quarter of the ring open. */}
      <circle cx="12" cy="12" r="9" strokeDasharray="42 14.5" strokeLinecap="butt" />
    </svg>
  );
}

export interface SpinnerProps {
  /** What is loading. Used as the accessible name, and shown when `showLabel` is on. */
  label?: string;
  /** Show the label next to the ring. */
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: 'accent' | 'muted' | 'current';
  /**
   * Hide the spinner from assistive tech. Use it when the surrounding text already says what is
   * happening, such as a Button reading "Saving…", so it is not announced twice.
   */
  decorative?: boolean;
  className?: string;
}

export function Spinner({
  label = 'Loading',
  showLabel = false,
  size = 'md',
  tone = 'accent',
  decorative = false,
  className,
}: SpinnerProps) {
  const s = spinnerStyles({ size, tone });

  if (decorative) {
    return <Ring className={s.icon({ className })} />;
  }

  return (
    <AriaProgressBar isIndeterminate aria-label={label} className={s.root({ className })}>
      <Ring className={s.icon()} />
      {showLabel && <span>{label}</span>}
    </AriaProgressBar>
  );
}
