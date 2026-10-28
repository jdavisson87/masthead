import type { ReactNode } from 'react';
import { tv } from 'tailwind-variants';

/**
 * A pull quote lifts a line out of an article. It is a <figure> holding a <blockquote> and an optional
 * <figcaption> with the <cite>. The opening quotation mark hangs in the margin so the text edge stays
 * aligned, and is hidden from assistive tech since the blockquote already says it is a quote.
 */
export const pullQuoteStyles = tv({
  slots: {
    root: 'm-0 font-serif text-text',
    quote: 'relative m-0 font-medium',
    mark: 'absolute right-full pr-[0.15em] text-accent select-none',
    caption: 'mt-md font-sans text-body-sm not-italic text-muted',
  },
  variants: {
    size: {
      md: { quote: 'text-heading-md', root: 'max-w-prose' },
      lg: { quote: 'text-heading-lg', root: 'max-w-3xl' },
    },
    align: {
      start: {},
      center: { root: 'mx-auto text-center', mark: 'static pr-0' },
    },
    rule: {
      true: { root: 'border-l-4 border-accent pl-lg' },
      false: {},
    },
  },
  defaultVariants: { size: 'md', align: 'start', rule: true },
});

export interface PullQuoteProps {
  /** The quoted text, without quotation marks. */
  children: ReactNode;
  /** Who said it, e.g. "Jane Doe, transit chair". */
  attribution?: ReactNode;
  /** Where it comes from, e.g. a document or article title. Wrapped in <cite>. */
  source?: ReactNode;
  /** URL of the source, exposed as the blockquote's `cite` attribute. */
  citeUrl?: string;
  size?: 'md' | 'lg';
  align?: 'start' | 'center';
  /** A vertical accent rule beside the quote. Ignored when centered. */
  rule?: boolean;
  className?: string;
}

export function PullQuote({ children, attribution, source, citeUrl, size = 'md', align = 'start', rule = true, className }: PullQuoteProps) {
  const s = pullQuoteStyles({ size, align, rule: rule && align === 'start' });
  return (
    <figure className={s.root({ className })}>
      <blockquote cite={citeUrl} className={s.quote()}>
        <p className="m-0 relative">
          <span aria-hidden="true" className={s.mark()}>
            “
          </span>
          {children}
          <span aria-hidden="true">”</span>
        </p>
      </blockquote>
      {(attribution || source) && (
        <figcaption className={s.caption()}>
          {attribution}
          {attribution && source && <span aria-hidden="true"> · </span>}
          {attribution && source && <span className="sr-only">, </span>}
          {source && <cite>{source}</cite>}
        </figcaption>
      )}
    </figure>
  );
}
