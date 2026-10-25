import { Label, ProgressBar as AriaProgressBar, type ProgressBarProps as AriaProgressBarProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * The track has a `border-strong` outline and the fill is a solid accent, so the amount is readable without
 * relying on subtle color differences (WCAG 1.4.11), and the value is also written as text.
 * Indeterminate bars slide a block along the track; with reduced motion they show a static, dimmed full bar.
 */
export const progressBarStyles = tv({
  slots: {
    root: 'flex w-full flex-col gap-1.5 font-sans',
    header: 'flex items-baseline justify-between gap-3',
    label: 'text-sm font-medium text-text',
    value: 'font-mono text-xs tabular-nums text-muted',
    track: 'masthead-control relative w-full overflow-hidden rounded-sm border border-border-strong bg-surface',
    fill: 'h-full rounded-[1px] transition-[width] duration-300 motion-reduce:transition-none',
  },
  variants: {
    size: {
      sm: { track: 'h-2' },
      md: { track: 'h-3' },
      lg: { track: 'h-4' },
    },
    tone: {
      accent: { fill: 'bg-accent' },
      success: { fill: 'bg-success' },
      danger: { fill: 'bg-danger' },
    },
    indeterminate: {
      true: { fill: 'absolute inset-y-0 left-0 w-1/3 animate-progress-indeterminate motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-50' },
      false: {},
    },
    hideLabel: {
      true: { label: 'sr-only' },
      false: {},
    },
  },
  defaultVariants: { size: 'md', tone: 'accent', indeterminate: false, hideLabel: false },
});

export interface ProgressBarProps extends Omit<AriaProgressBarProps, 'className' | 'children' | 'aria-label'> {
  /** Names the bar. Always required; use `hideLabel` to keep it screen-reader-only. */
  label: string;
  /** Hide the label visually; it stays available to assistive tech. */
  hideLabel?: boolean;
  /** Show the value ("40%", or your `valueLabel`) next to the label. */
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** `success` and `danger` are for finished or failed work; the value text still carries the meaning. */
  tone?: 'accent' | 'success' | 'danger';
  className?: string;
}

export function ProgressBar({
  label,
  hideLabel = false,
  showValue = true,
  size = 'md',
  tone = 'accent',
  className,
  ...props
}: ProgressBarProps) {
  return (
    <AriaProgressBar {...props} aria-label={undefined} className={progressBarStyles().root({ className })}>
      {({ percentage, valueText, isIndeterminate }) => {
        const s = progressBarStyles({ size, tone, indeterminate: isIndeterminate, hideLabel });
        return (
          <>
            <div className={s.header()}>
              <Label className={s.label()}>{label}</Label>
              {showValue && !isIndeterminate && valueText && <span className={s.value()}>{valueText}</span>}
            </div>
            <div className={s.track()}>
              <div
                data-fill=""
                className={s.fill()}
                style={isIndeterminate ? undefined : { width: `${percentage ?? 0}%` }}
              />
            </div>
          </>
        );
      }}
    </AriaProgressBar>
  );
}
