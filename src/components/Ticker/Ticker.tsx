import { useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from 'react';
import { tv } from 'tailwind-variants';
import { IconButton } from '../IconButton/IconButton';

/**
 * A news-style ticker: items scroll continuously and loop. Feed it any list (MLB scores, stock quotes, headlines).
 *
 * Accessibility, because moving text is easy to get wrong:
 * - It can always be paused (WCAG 2.2.2): a pause button, plus it pauses while hovered or focused.
 * - With `prefers-reduced-motion` it does not move at all: the items sit in a normal scrollable row.
 * - Screen readers get one plain list. The looping copies are hidden from them and from the tab order.
 * - Up / down tones show an arrow and hidden text as well as color.
 */
export const tickerStyles = tv({
  slots: {
    root: 'flex items-stretch overflow-hidden border-y border-border-strong bg-surface font-sans text-sm text-text',
    heading:
      'flex shrink-0 items-center bg-text px-3 font-mono text-xs font-medium uppercase tracking-wider text-bg',
    viewport: 'relative min-w-0 flex-1 overflow-hidden motion-reduce:overflow-x-auto',
    track: 'flex w-max animate-ticker motion-reduce:w-auto motion-reduce:animate-none',
    half: 'flex shrink-0 motion-reduce:w-auto',
    set: 'm-0 flex shrink-0 list-none items-center p-0',
    item: 'flex items-center py-2.5',
    sep: 'mx-5 size-1.5 shrink-0 bg-border-strong',
    entry: 'whitespace-nowrap',
    link: [
      'whitespace-nowrap underline decoration-border-strong underline-offset-4 outline-hidden hover:text-accent hover:decoration-accent',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    ],
    controls: 'flex shrink-0 items-center border-l border-border-strong px-1 motion-reduce:hidden',
  },
  variants: {
    // Only the first copy is read and tabbed to; the rest are visual filler and are hidden when motion is off.
    filler: {
      true: { set: 'motion-reduce:hidden' },
      false: {},
    },
    tone: {
      up: { entry: 'text-success', link: 'text-success' },
      down: { entry: 'text-danger', link: 'text-danger' },
      none: {},
    },
  },
  defaultVariants: { filler: false, tone: 'none' },
});

export interface TickerItem {
  /** Stable key for the item. */
  id: string | number;
  content: ReactNode;
  /** Makes the item a link. */
  href?: string;
  target?: '_blank';
  /** `up` and `down` add an arrow and a screen-reader note, plus color. */
  tone?: 'up' | 'down';
}

const DEFAULT_LAYOUT = { repeat: 1, duration: 30 };

/**
 * How many copies of the content each half needs to fill the viewport, and how long one loop takes
 * at `speed` pixels per second. Exported for testing.
 */
export function computeTickerLayout(viewportWidth: number, contentWidth: number, speed: number) {
  if (!(contentWidth > 0) || !(speed > 0)) return DEFAULT_LAYOUT;
  const repeat = Math.max(1, Math.ceil(viewportWidth / contentWidth));
  return { repeat, duration: (repeat * contentWidth) / speed };
}

const normalize = (items: (string | TickerItem)[]): TickerItem[] =>
  items.map((item, i) => (typeof item === 'string' ? { id: `${i}-${item}`, content: item } : item));

function ToneMark({ tone }: { tone: 'up' | 'down' }) {
  return (
    <span aria-hidden="true" className="mr-1.5 text-[0.7em]">
      {tone === 'up' ? '▲' : '▼'}
    </span>
  );
}

function Entry({ item, hidden }: { item: TickerItem; hidden: boolean }) {
  const s = tickerStyles({ tone: item.tone ?? 'none' });
  const body = (
    <>
      {item.tone && <ToneMark tone={item.tone} />}
      {item.content}
      {item.tone && <span className="sr-only">, {item.tone}</span>}
      {item.target === '_blank' && <span className="sr-only">, opens in a new tab</span>}
    </>
  );
  if (!item.href) return <span className={s.entry()}>{body}</span>;
  return (
    <a
      href={item.href}
      target={item.target}
      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
      tabIndex={hidden ? -1 : undefined}
      className={s.link()}
    >
      {body}
    </a>
  );
}

const icon = { viewBox: '0 0 16 16', fill: 'currentColor' } as const;
const PauseIcon = () => (
  <svg {...icon}>
    <rect x="4" y="3" width="3" height="10" />
    <rect x="9" y="3" width="3" height="10" />
  </svg>
);
const PlayIcon = () => (
  <svg {...icon}>
    <path d="M5 3l8 5-8 5z" />
  </svg>
);

export interface TickerProps {
  /** Strings, or objects when you need links, tones or stable ids. */
  items: (string | TickerItem)[];
  /** Names the ticker for assistive tech ("Live MLB scores"). Always required. */
  label: string;
  /** A short tag at the left edge, such as "MLB" or "Markets". */
  heading?: string;
  /** Pixels per second. */
  speed?: number;
  direction?: 'left' | 'right';
  /** Pause while the pointer is over the ticker. Focus always pauses it. */
  pauseOnHover?: boolean;
  /**
   * Show the pause / play button. Leave it on: moving content that lasts more than 5 seconds must be
   * pausable (WCAG 2.2.2). Only hide it if the page offers another way to stop it.
   */
  showControls?: boolean;
  /** Fade the left and right edges. */
  fade?: boolean;
  className?: string;
}

export function Ticker({
  items,
  label,
  heading,
  speed = 60,
  direction = 'left',
  pauseOnHover = true,
  showControls = true,
  fade = true,
  className,
}: TickerProps) {
  const list = useMemo(() => normalize(items), [items]);
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [userPaused, setUserPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLUListElement>(null);

  // Measure one copy and the viewport so the loop is always long enough to fill the screen, at a steady speed.
  useEffect(() => {
    const viewport = viewportRef.current;
    const first = setRef.current;
    if (!viewport || !first || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const next = computeTickerLayout(viewport.clientWidth, first.scrollWidth, speed);
      setLayout((prev) => (prev.repeat === next.repeat && prev.duration === next.duration ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(first);
    return () => observer.disconnect();
  }, [speed, list]);

  if (list.length === 0) return null;

  const s = tickerStyles();
  const paused = userPaused || engaged;

  const renderSet = (key: string, filler: boolean, ref?: Ref<HTMLUListElement>) => (
    <ul key={key} ref={ref} aria-hidden={filler || undefined} className={tickerStyles({ filler }).set()}>
      {list.map((item) => (
        <li key={item.id} className={s.item()}>
          <Entry item={item} hidden={filler} />
          <span aria-hidden="true" className={s.sep()} />
        </li>
      ))}
    </ul>
  );

  const renderHalf = (half: 'a' | 'b') => (
    <div key={half} className={s.half()} aria-hidden={half === 'b' || undefined}>
      {Array.from({ length: layout.repeat }, (_, i) =>
        renderSet(`${half}${i}`, half === 'b' || i > 0, half === 'a' && i === 0 ? setRef : undefined),
      )}
    </div>
  );

  return (
    <div role="region" aria-label={label} className={s.root({ className })}>
      {heading && <span className={s.heading()}>{heading}</span>}
      <div
        ref={viewportRef}
        className={s.viewport()}
        style={
          fade
            ? {
                maskImage: 'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)',
              }
            : undefined
        }
        onMouseEnter={pauseOnHover ? () => setEngaged(true) : undefined}
        onMouseLeave={pauseOnHover ? () => setEngaged(false) : undefined}
        onFocus={() => setEngaged(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false);
        }}
      >
        <div
          data-ticker-track=""
          className={s.track()}
          style={{
            animationDuration: `${layout.duration}s`,
            animationDirection: direction === 'right' ? 'reverse' : 'normal',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {renderHalf('a')}
          {renderHalf('b')}
        </div>
      </div>
      {showControls && (
        <div className={s.controls()}>
          <IconButton
            size="sm"
            aria-label={userPaused ? 'Play ticker' : 'Pause ticker'}
            onPress={() => setUserPaused((v) => !v)}
          >
            {userPaused ? <PlayIcon /> : <PauseIcon />}
          </IconButton>
        </div>
      )}
    </div>
  );
}
