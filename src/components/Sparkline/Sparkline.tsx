import { tv } from 'tailwind-variants';

/**
 * A tiny inline chart of a trend. It is one image (`role="img"`) whose accessible name is a spoken summary:
 * what it measures, where it started and ended, the change, and the low and high. A chart of this size
 * can't be explored point by point, so the summary is the content for people who can't see it.
 */
export const sparklineStyles = tv({
  base: 'inline-block shrink-0 overflow-visible align-middle',
  variants: {
    tone: {
      accent: 'text-accent',
      muted: 'text-muted',
      success: 'text-success',
      danger: 'text-danger',
    },
  },
  defaultVariants: { tone: 'accent' },
});

export interface SeriesSummary {
  count: number;
  first: number;
  last: number;
  min: number;
  max: number;
  change: number;
  /** Percent change from first to last; null when the first value is 0. */
  changePercent: number | null;
  direction: 'up' | 'down' | 'flat';
}

const finite = (data: number[]) => data.filter((n) => Number.isFinite(n));

export function summarizeSeries(data: number[]): SeriesSummary | null {
  const values = finite(data);
  if (values.length === 0) return null;
  const first = values[0] as number;
  const last = values[values.length - 1] as number;
  const change = last - first;
  return {
    count: values.length,
    first,
    last,
    min: Math.min(...values),
    max: Math.max(...values),
    change,
    changePercent: first === 0 ? null : (change / Math.abs(first)) * 100,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
  };
}

export interface Point {
  x: number;
  y: number;
}

/** Map values into the drawing box. The highest value touches the top padding, the lowest the bottom. */
export function getSparklinePoints(data: number[], width: number, height: number, pad = 3): Point[] {
  const values = finite(data);
  const n = values.length;
  if (n === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  return values.map((v, i) => ({
    x: n === 1 ? width / 2 : pad + (i * (width - 2 * pad)) / (n - 1),
    y: range === 0 ? height / 2 : pad + (1 - (v - min) / range) * (height - 2 * pad),
  }));
}

const round = (n: number) => Math.round(n * 100) / 100;

export interface SparklineProps {
  data: number[];
  /** What the series measures, e.g. "Daily visitors". Starts the spoken summary. */
  label: string;
  variant?: 'line' | 'area' | 'bars';
  width?: number;
  height?: number;
  tone?: 'accent' | 'muted' | 'success' | 'danger';
  /** Dot on the latest value (line and area). */
  showEndpoint?: boolean;
  /** Formats numbers in the spoken summary. */
  formatValue?: (value: number) => string;
  locale?: string;
  className?: string;
}

export function describeSeries(label: string, s: SeriesSummary, format: (n: number) => string): string {
  const change =
    s.direction === 'flat'
      ? 'no change'
      : `${s.direction} ${s.changePercent === null ? format(Math.abs(s.change)) : `${format(Math.abs(round(s.changePercent)))}%`}`;
  if (s.count === 1) return `${label}: ${format(s.last)}.`;
  return `${label}: ${s.count} values. Started at ${format(s.first)}, ended at ${format(s.last)}, ${change}. Low ${format(s.min)}, high ${format(s.max)}.`;
}

export function Sparkline({
  data,
  label,
  variant = 'line',
  width = 120,
  height = 32,
  tone = 'accent',
  showEndpoint = true,
  formatValue,
  locale = 'en-US',
  className,
}: SparklineProps) {
  const summary = summarizeSeries(data);
  if (!summary) return null;

  const format = formatValue ?? ((n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n));
  const values = finite(data);
  const points = getSparklinePoints(values, width, height);
  const pad = 3;

  let shapes;
  if (variant === 'bars') {
    const lo = Math.min(0, summary.min);
    const hi = Math.max(0, summary.max);
    const span = hi - lo;
    const y = (v: number) => (span === 0 ? height : pad + (1 - (v - lo) / span) * (height - 2 * pad));
    const baseline = y(0);
    const slot = width / values.length;
    const barWidth = Math.max(1, slot * 0.7);
    shapes = values.map((v, i) => {
      const top = Math.min(y(v), baseline);
      return (
        <rect
          key={i}
          x={round(i * slot + (slot - barWidth) / 2)}
          y={round(top)}
          width={round(barWidth)}
          height={round(Math.max(1, Math.abs(baseline - y(v))))}
          fill="currentColor"
        />
      );
    });
  } else {
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${round(p.x)} ${round(p.y)}`).join(' ');
    const first = points[0] as Point;
    const last = points[points.length - 1] as Point;
    shapes = (
      <>
        {variant === 'area' && points.length > 1 && (
          <path d={`${line} L${round(last.x)} ${height} L${round(first.x)} ${height} Z`} fill="currentColor" fillOpacity={0.15} stroke="none" />
        )}
        {points.length > 1 && (
          <path d={line} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        )}
        {(showEndpoint || points.length === 1) && <circle cx={round(last.x)} cy={round(last.y)} r={2.5} fill="currentColor" />}
      </>
    );
  }

  return (
    <svg
      role="img"
      aria-label={describeSeries(label, summary, format)}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={sparklineStyles({ tone, className })}
    >
      {shapes}
    </svg>
  );
}
