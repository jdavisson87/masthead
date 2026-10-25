import { Button as AriaButton, Link as AriaLink } from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * Pagination is navigation, so it renders a labelled <nav> with a list of controls.
 * The current page is marked with aria-current="page" and drawn filled, so it never relies on color alone.
 * The visible row keeps a constant width as you move through pages (ellipses fill the gaps),
 * which stops the Previous/Next buttons from jumping under the pointer.
 */
export const paginationStyles = tv({
  slots: {
    root: 'font-sans',
    list: 'm-0 flex list-none flex-wrap items-center gap-1 p-0',
    item: 'flex',
    control: [
      'masthead-control inline-flex min-w-9 cursor-default select-none items-center justify-center gap-1.5 rounded-sm border px-2 text-sm font-medium no-underline outline-hidden transition-colors motion-reduce:transition-none',
      'data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-accent',
    ],
    ellipsis: 'inline-flex min-w-9 select-none items-center justify-center text-sm text-muted',
    summary: 'text-sm text-muted',
  },
  variants: {
    size: {
      sm: { control: 'h-8', ellipsis: 'h-8' },
      md: { control: 'h-10', ellipsis: 'h-10' },
    },
    current: {
      true: { control: 'border-accent bg-accent text-accent-fg underline decoration-2 underline-offset-4' },
      false: {
        control:
          'border-border-strong bg-surface text-text data-[hovered]:border-text data-[hovered]:bg-raised data-[pressed]:bg-raised',
      },
    },
    disabled: {
      true: { control: 'cursor-not-allowed opacity-50' },
      false: {},
    },
  },
  defaultVariants: { size: 'md', current: false, disabled: false },
});

/** One entry in the visible row: a page number or a gap marker. */
export type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis';

const range = (from: number, to: number) => (to >= from ? Array.from({ length: to - from + 1 }, (_, i) => from + i) : []);

/**
 * Compute the visible row. Always returns the same number of entries for a given
 * `siblings`/`boundaries` once `count` is large enough, so the row never changes width.
 */
export function getPaginationRange(page: number, count: number, siblings = 1, boundaries = 1): PaginationItem[] {
  if (count < 1) return [];
  const current = Math.min(Math.max(page, 1), count);
  const start = range(1, Math.min(boundaries, count));
  const end = range(Math.max(count - boundaries + 1, boundaries + 1), count);

  const siblingsStart = Math.max(Math.min(current - siblings, count - boundaries - siblings * 2 - 1), boundaries + 2);
  const siblingsEnd = Math.min(
    Math.max(current + siblings, boundaries + siblings * 2 + 2),
    end.length > 0 ? (end[0] as number) - 2 : count - 1,
  );

  const items: PaginationItem[] = [...start];
  if (siblingsStart > boundaries + 2) items.push('start-ellipsis');
  else if (boundaries + 1 < count - boundaries) items.push(boundaries + 1);
  items.push(...range(siblingsStart, siblingsEnd));
  if (siblingsEnd < count - boundaries - 1) items.push('end-ellipsis');
  else if (count - boundaries > boundaries) items.push(count - boundaries);
  items.push(...end);
  return items;
}

export interface PaginationProps {
  /** Total number of pages. */
  count: number;
  /** Current page, 1-based. */
  page: number;
  onPageChange: (page: number) => void;
  /** Accessible name for the navigation landmark. Give each pagination on a page a distinct one. */
  'aria-label'?: string;
  /** Pages shown on each side of the current page. */
  siblings?: number;
  /** Pages always shown at the start and end. */
  boundaries?: number;
  size?: 'sm' | 'md';
  /** When provided, controls render as links (for server-rendered or routed lists) instead of buttons. */
  getHref?: (page: number) => string;
  /** Show a "Page 3 of 10" summary beside the controls. */
  showSummary?: boolean;
  isDisabled?: boolean;
  className?: string;
}

const icon = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export function Pagination({
  count,
  page,
  onPageChange,
  'aria-label': ariaLabel = 'Pagination',
  siblings = 1,
  boundaries = 1,
  size = 'md',
  getHref,
  showSummary = false,
  isDisabled = false,
  className,
}: PaginationProps) {
  const s = paginationStyles({ size });
  const current = Math.min(Math.max(page, 1), Math.max(count, 1));
  const items = getPaginationRange(current, count, siblings, boundaries);

  if (count < 1) return null;

  const control = (target: number, label: string, children: React.ReactNode, opts: { current?: boolean; disabled?: boolean } = {}) => {
    const disabled = isDisabled || !!opts.disabled;
    const cls = paginationStyles({ size, current: !!opts.current, disabled }).control();
    if (getHref && !disabled) {
      return (
        <AriaLink
          href={getHref(target)}
          aria-label={label}
          aria-current={opts.current ? 'page' : undefined}
          className={cls}
          onPress={() => onPageChange(target)}
        >
          {children}
        </AriaLink>
      );
    }
    return (
      <AriaButton
        aria-label={label}
        aria-current={opts.current ? 'page' : undefined}
        isDisabled={disabled}
        className={cls}
        onPress={() => onPageChange(target)}
      >
        {children}
      </AriaButton>
    );
  };

  return (
    <nav aria-label={ariaLabel} className={s.root({ className: `flex flex-wrap items-center gap-3 ${className ?? ''}` })}>
      <ul className={s.list()}>
        <li className={s.item()}>
          {control(
            current - 1,
            'Previous page',
            <>
              <svg {...icon} className="size-4"><path d="M10 3.5L5.5 8l4.5 4.5" /></svg>
              <span className="max-sm:sr-only">Previous</span>
            </>,
            { disabled: current <= 1 },
          )}
        </li>
        {items.map((entry) =>
          typeof entry === 'number' ? (
            <li key={entry} className={s.item()}>
              {control(entry, `Page ${entry}`, entry, { current: entry === current })}
            </li>
          ) : (
            <li key={entry} className={s.item()}>
              <span className={s.ellipsis()}>
                <span aria-hidden="true">…</span>
                <span className="sr-only">More pages</span>
              </span>
            </li>
          ),
        )}
        <li className={s.item()}>
          {control(
            current + 1,
            'Next page',
            <>
              <span className="max-sm:sr-only">Next</span>
              <svg {...icon} className="size-4"><path d="M6 3.5L10.5 8 6 12.5" /></svg>
            </>,
            { disabled: current >= count },
          )}
        </li>
      </ul>
      {showSummary && (
        <p className={s.summary()} aria-live="polite">
          Page {current} of {count}
        </p>
      )}
    </nav>
  );
}
