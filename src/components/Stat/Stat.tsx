import type { ReactNode } from 'react';
import { tv } from 'tailwind-variants';
import { Delta, getDeltaSentiment, type DeltaProps } from './Delta';
import { Sparkline, type SparklineProps } from '../Sparkline/Sparkline';

/**
 * A single headline number with its context: label, value, change, and an optional trend line.
 * It is a description list (term and details), so assistive tech reads "Revenue: $48,200, up 12.5%
 * versus last month, trend: ...". Drop it inside a Card, or lay several out in a grid.
 */
export const statStyles = tv({
  slots: {
    root: 'm-0 flex flex-col gap-1 font-sans text-text',
    label: 'm-0 font-mono text-body-xs font-medium uppercase tracking-[0.12em] text-muted',
    value: 'm-0 font-serif font-semibold leading-none tabular-nums',
    row: 'm-0 flex flex-wrap items-center gap-x-4 gap-y-1',
    hint: 'm-0 text-body-sm text-muted',
  },
  variants: {
    size: {
      md: { value: 'text-heading-lg' },
      lg: { value: 'text-heading-xl' },
    },
  },
  defaultVariants: { size: 'md' },
});

export interface StatProps {
  label: string;
  /** The headline number, already formatted: "$48,200", "1.2M", "98.6%". */
  value: ReactNode;
  /** Change since the comparison period. See Delta for how it is shown. */
  delta?: number;
  deltaFormat?: DeltaProps['format'];
  /** Lower is better for this metric. */
  invertDelta?: boolean;
  /** Context for the change, e.g. "vs last month". */
  period?: string;
  /** Recent values for a trend line. */
  trend?: number[];
  /** Name for the trend line. Defaults to "<label> trend". */
  trendLabel?: string;
  trendVariant?: SparklineProps['variant'];
  /** Format numbers in the trend's spoken summary. */
  formatTrendValue?: SparklineProps['formatValue'];
  /** Small supporting text under the numbers. */
  hint?: ReactNode;
  size?: 'md' | 'lg';
  locale?: string;
  className?: string;
}

export function Stat({
  label,
  value,
  delta,
  deltaFormat = 'percent',
  invertDelta = false,
  period,
  trend,
  trendLabel,
  trendVariant = 'line',
  formatTrendValue,
  hint,
  size = 'md',
  locale,
  className,
}: StatProps) {
  const s = statStyles({ size });
  const sentiment = delta === undefined ? 'neutral' : getDeltaSentiment(delta, invertDelta);
  const tone = sentiment === 'good' ? 'success' : sentiment === 'bad' ? 'danger' : delta === undefined ? 'accent' : 'muted';
  const hasTrend = trend !== undefined && trend.length > 0;

  return (
    <dl className={s.root({ className })}>
      <dt className={s.label()}>{label}</dt>
      <dd className={s.value()}>{value}</dd>
      {(delta !== undefined || hasTrend) && (
        <dd className={s.row()}>
          {delta !== undefined && <Delta value={delta} format={deltaFormat} invert={invertDelta} period={period} locale={locale} size="sm" />}
          {hasTrend && (
            <Sparkline
              data={trend}
              label={trendLabel ?? `${label} trend`}
              variant={trendVariant}
              tone={tone}
              formatValue={formatTrendValue}
              locale={locale}
              width={96}
              height={28}
            />
          )}
        </dd>
      )}
      {hint && <dd className={s.hint()}>{hint}</dd>}
    </dl>
  );
}
