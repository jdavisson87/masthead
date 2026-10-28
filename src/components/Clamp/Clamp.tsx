import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * Collapses long text to a fixed number of lines. The toggle appears only when the text really is cut off,
 * and reports its state with aria-expanded. The full text always stays in the DOM, so the clamp is a visual
 * convenience only: screen readers and find-in-page still reach everything.
 */
export const clampStyles = tv({
  slots: {
    root: 'font-sans',
    content: 'm-0',
    toggle: [
      'mt-1 cursor-pointer rounded-sm text-body-sm font-medium text-accent underline underline-offset-4 outline-hidden',
      'data-[hovered]:text-accent-hover data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-accent',
    ],
  },
  variants: {
    collapsed: {
      true: { content: 'overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical]' },
      false: {},
    },
  },
  defaultVariants: { collapsed: true },
});

export interface ClampProps {
  children: ReactNode;
  /** Lines shown while collapsed. */
  lines?: number;
  moreLabel?: string;
  lessLabel?: string;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

export function Clamp({ children, lines = 3, moreLabel = 'Read more', lessLabel = 'Show less', defaultExpanded = false, onExpandedChange, className }: ClampProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [overflowing, setOverflowing] = useState(false);

  // Measure only while collapsed: once open there is nothing cut off to compare against.
  const measure = useCallback(() => {
    const el = ref.current;
    if (el && !expanded) setOverflowing(el.scrollHeight - el.clientHeight > 1);
  }, [expanded]);

  useLayoutEffect(measure, [measure, children, lines]);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const s = clampStyles({ collapsed: !expanded });
  const toggle = () => {
    setExpanded(!expanded);
    onExpandedChange?.(!expanded);
  };

  return (
    <div className={s.root({ className })}>
      <div id={id} ref={ref} className={s.content()} style={expanded ? undefined : { WebkitLineClamp: lines }}>
        {children}
      </div>
      {(overflowing || expanded) && (
        <AriaButton className={s.toggle()} aria-expanded={expanded} aria-controls={id} onPress={toggle}>
          {expanded ? lessLabel : moreLabel}
        </AriaButton>
      )}
    </div>
  );
}
