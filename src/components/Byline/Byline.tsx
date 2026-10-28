import { Fragment, type ReactNode } from 'react';
import { tv } from 'tailwind-variants';
import { Avatar } from '../Avatar/Avatar';
import { Link } from '../Link/Link';

/**
 * The dateline under a headline: "By Ada Lovelace and Grace Hopper · Reuters · October 26, 2026 · 6 min read".
 * Authors can link to their pages, the date is a real <time> element, and the avatars are decorative
 * because the names are already printed beside them.
 */
export const bylineStyles = tv({
  slots: {
    root: 'flex flex-wrap items-center gap-x-3 gap-y-1.5 font-sans text-body-sm text-muted',
    avatars: 'flex -space-x-2',
    text: 'm-0 flex flex-wrap items-center gap-x-2',
    author: 'font-medium text-text',
    sep: 'select-none',
  },
});

export interface BylineAuthor {
  name: string;
  /** Link to the author's page. */
  href?: string;
  /** Photo for the avatar. */
  src?: string;
}

export interface BylineProps {
  authors: BylineAuthor[];
  /** A Date, or an ISO string. A date-only string ("2026-10-26") is read as that calendar day, not shifted by time zone. */
  date?: Date | string;
  /** Publication or desk, e.g. "Reuters". */
  publication?: string;
  /** Estimated reading time in minutes. */
  readingMinutes?: number;
  /** Show author avatars. */
  showAvatars?: boolean;
  /** BCP 47 locale for the date and the author list. */
  locale?: string;
  className?: string;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function formatBylineDate(date: Date | string, locale = 'en-US'): { text: string; iso: string } {
  const dateOnly = typeof date === 'string' && DATE_ONLY.test(date);
  const value = typeof date === 'string' ? new Date(dateOnly ? `${date}T00:00:00Z` : date) : date;
  if (Number.isNaN(value.getTime())) return { text: String(date), iso: String(date) };
  const text = new Intl.DateTimeFormat(locale, { dateStyle: 'long', ...(dateOnly ? { timeZone: 'UTC' } : {}) }).format(value);
  const iso = dateOnly ? (date as string) : value.toISOString();
  return { text, iso };
}

export function Byline({ authors, date, publication, readingMinutes, showAvatars = false, locale = 'en-US', className }: BylineProps) {
  const s = bylineStyles();
  const formatted = date !== undefined ? formatBylineDate(date, locale) : null;

  const authorNode = (a: BylineAuthor) =>
    a.href ? (
      <Link href={a.href} intent="subtle" className={s.author()}>
        {a.name}
      </Link>
    ) : (
      <span className={s.author()}>{a.name}</span>
    );

  // "A, B and C" in the reader's language, with each name still a real element (so it can be a link).
  const byParts = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).formatToParts(authors.map((_, i) => String(i)));
  const names: ReactNode = byParts.map((part, i) =>
    part.type === 'element' ? <Fragment key={i}>{authorNode(authors[Number(part.value)] as BylineAuthor)}</Fragment> : <Fragment key={i}>{part.value}</Fragment>,
  );

  const meta: ReactNode[] = [];
  if (publication) meta.push(<span key="pub">{publication}</span>);
  if (formatted) meta.push(<time key="date" dateTime={formatted.iso}>{formatted.text}</time>);
  if (readingMinutes !== undefined) meta.push(<span key="read">{readingMinutes} min read</span>);

  if (authors.length === 0 && meta.length === 0) return null;

  return (
    <div className={s.root({ className })}>
      {showAvatars && authors.length > 0 && (
        <span aria-hidden="true" className={s.avatars()}>
          {authors.slice(0, 3).map((a, i) => (
            <Avatar key={`${a.name}-${i}`} name={a.name} src={a.src} size="sm" decorative className="ring-2 ring-bg" />
          ))}
        </span>
      )}
      <p className={s.text()}>
        {authors.length > 0 && <span>By {names}</span>}
        {meta.map((node, i) => (
          <Fragment key={i}>
            {(i > 0 || authors.length > 0) && (
              <>
                <span aria-hidden="true" className={s.sep()}>·</span>
                <span className="sr-only">,</span>
              </>
            )}
            {node}
          </Fragment>
        ))}
      </p>
    </div>
  );
}
