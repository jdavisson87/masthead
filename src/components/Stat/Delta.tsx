import { tv } from 'tailwind-variants';

/**
 * A change indicator: an arrow, the size of the change, and an optional period ("vs last month").
 * Direction is shown by the arrow shape and read aloud as "Up" / "Down" / "No change", so it never
 * depends on color. Color adds meaning on top: green when the change is good, red when it is bad.
 * For metrics where lower is better (cost, errors, load time) set `invert`.
 */
export const deltaStyles = tv({
  slots: {
    root: 'inline-flex items-center gap-x-2 font-sans tabular-nums',
    change: 'inline-flex items-center gap-1 font-medium',
    period: 'font-normal text-muted',
  },
  variants: {
    sentiment: {
      good: { change: 'text-success' },
      bad: { change: 'text-danger' },
      neutral: { change: 'text-muted' },
    },
    size: {
      sm: { root: 'text-body-sm' },
      md: { root: 'text-body-md' },
    },
  },
  defaultVariants: { sentiment: 'neutral', size: 'sm' },
});

export type DeltaDirection = 'up' | 'down' | 'flat';
export type DeltaSentiment = 'good' | 'bad' | 'neutral';

export const getDeltaDirection = (value: number): DeltaDirection => (value > 0 ? 'up' : value < 0 ? 'down' : 'flat');

export function getDeltaSentiment(value: number, invert = false): DeltaSentiment {
  const direction = getDeltaDirection(value);
  if (direction === 'flat') return 'neutral';
  return (direction === 'up') !== invert ? 'good' : 'bad';
}

const svg = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

function Arrow({ direction }: { direction: DeltaDirection }) {
  return (
    <svg {...svg} className="size-4 shrink-0">
      {direction === 'up' && <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" />}
      {direction === 'down' && <path d="M8 3v10M3.5 8.5L8 13l4.5-4.5" />}
      {direction === 'flat' && <path d="M3 8h10" />}
    </svg>
  );
}

export interface DeltaProps {
  /** The change. For "percent" this is already in percent: 12.5 means 12.5%. Negative means down. */
  value: number;
  format?: 'percent' | 'number';
  /** Lower is better: a decrease is shown as good and an increase as bad. */
  invert?: boolean;
  /** Context after the number, e.g. "vs last month". */
  period?: string;
  /** Digits after the decimal point, at most. */
  precision?: number;
  /** Override how the size of the change is written (receives the absolute value). */
  formatValue?: (absolute: number) => string;
  size?: 'sm' | 'md';
  locale?: string;
  className?: string;
}

export function formatDeltaValue(value: number, format: 'percent' | 'number', precision: number, locale: string): string {
  const abs = Math.abs(value);
  return format === 'percent'
    ? new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: precision }).format(abs / 100)
    : new Intl.NumberFormat(locale, { maximumFractionDigits: precision }).format(abs);
}

// "vs" is read letter by letter by some screen readers.
const speakable = (period: string) => period.replace(/^vs\.?(?=\s|$)/i, 'versus');

export function Delta({ value, format = 'percent', invert = false, period, precision = 1, formatValue, size = 'sm', locale = 'en-US', className }: DeltaProps) {
  const direction = getDeltaDirection(value);
  const sentiment = getDeltaSentiment(value, invert);
  const s = deltaStyles({ sentiment, size });
  const amount = formatValue ? formatValue(Math.abs(value)) : formatDeltaValue(value, format, precision, locale);
  const word = direction === 'up' ? 'Up' : direction === 'down' ? 'Down' : 'No change';
  const spoken = direction === 'flat' ? word : `${word} ${amount}`;

  return (
    <span className={s.root({ className })}>
      <span className="sr-only">{period ? `${spoken} ${speakable(period)}` : spoken}</span>
      <span aria-hidden="true" className={s.change()}>
        <Arrow direction={direction} />
        {direction === 'flat' ? '0' : amount}
      </span>
      {period && (
        <span aria-hidden="true" className={s.period()}>
          {period}
        </span>
      )}
    </span>
  );
}
