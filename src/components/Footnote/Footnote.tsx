import { useState, useSyncExternalStore, useId, type ReactNode } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * Three pieces that work together for articles with notes:
 *
 * - FootnoteRef: a numbered marker in the text that links to its note at the end.
 * - Footnotes:   the numbered list of notes, each with a back-link to where you were reading.
 * - Sidenote:    a note beside the text. On wide screens it sits in the margin; on narrow screens the
 *                number becomes a button that opens the note inline.
 *
 * Use FootnoteRef + Footnotes for long notes and print-style endnotes. Use Sidenote for short asides.
 * Numbers are explicit (you pass `number`) so they are stable and identical on server and client.
 */
export const footnoteStyles = tv({
  slots: {
    marker: 'ml-0.5 align-super text-[0.75em] font-medium leading-none',
    refLink:
      'rounded-sm px-0.5 font-sans text-accent underline decoration-1 underline-offset-2 outline-hidden hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    section: 'font-sans text-body-sm text-text',
    heading: 'm-0 mb-sm font-mono text-body-xs font-medium uppercase tracking-[0.12em] text-muted',
    list: 'm-0 flex list-none flex-col gap-sm p-0',
    item: 'flex scroll-mt-lg gap-sm rounded-sm outline-hidden target:bg-raised focus-visible:outline-2 focus-visible:outline-accent',
    number: 'w-6 shrink-0 text-right font-mono text-body-xs leading-[inherit] text-muted tabular-nums',
    body: 'min-w-0',
    backLink:
      'ml-1 rounded-sm px-0.5 text-accent no-underline outline-hidden hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    toggle:
      'ml-0.5 inline-flex min-w-[1.25rem] cursor-pointer items-center justify-center rounded-sm border border-border-strong bg-surface px-1 align-super font-sans text-[0.7rem] font-medium leading-4 text-accent outline-hidden data-[hovered]:bg-raised data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-accent',
    note: 'font-sans text-body-sm leading-snug text-muted',
  },
  variants: {
    placement: {
      // In the margin, beside the text it belongs to. The reading column needs free space on its right.
      margin: {
        note: 'float-right clear-right mt-1 w-[var(--sidenote-width,14rem)] -mr-[calc(var(--sidenote-width,14rem)+var(--sidenote-gap,2rem))]',
      },
      // Opened inline, under the text.
      inline: {
        note: 'my-sm block border-l-2 border-accent pl-sm',
      },
    },
  },
});

export const footnoteId = (number: number | string, prefix = 'fn') => `${prefix}-${number}`;
export const footnoteRefId = (number: number | string, prefix = 'fn') => `${prefix}ref-${number}`;

export interface FootnoteRefProps {
  number: number;
  /** Change when a page has more than one set of notes, so ids stay unique. */
  idPrefix?: string;
  className?: string;
}

export function FootnoteRef({ number, idPrefix = 'fn', className }: FootnoteRefProps) {
  const s = footnoteStyles();
  return (
    <sup className={s.marker({ className })}>
      <a id={footnoteRefId(number, idPrefix)} href={`#${footnoteId(number, idPrefix)}`} aria-label={`Footnote ${number}`} className={s.refLink()}>
        {number}
      </a>
    </sup>
  );
}

export interface FootnoteItem {
  number: number;
  children: ReactNode;
}

export interface FootnotesProps {
  notes: FootnoteItem[];
  title?: string;
  /** Heading level for the title. */
  headingLevel?: 2 | 3 | 4;
  idPrefix?: string;
  className?: string;
}

export function Footnotes({ notes, title = 'Notes', headingLevel = 2, idPrefix = 'fn', className }: FootnotesProps) {
  const s = footnoteStyles();
  const headingId = useId();
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  if (notes.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className={s.section({ className })}>
      <Heading id={headingId} className={s.heading()}>
        {title}
      </Heading>
      <ol className={s.list()}>
        {notes.map((note) => (
          <li key={note.number} id={footnoteId(note.number, idPrefix)} tabIndex={-1} className={s.item()}>
            <span aria-hidden="true" className={s.number()}>
              {note.number}.
            </span>
            <span className={s.body()}>
              {note.children}
              <a href={`#${footnoteRefId(note.number, idPrefix)}`} aria-label={`Back to reference ${note.number}`} className={s.backLink()}>
                <span aria-hidden="true">↩</span>
              </a>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function subscribe(query: string, onChange: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** True when the media query matches. False on the server and when matchMedia is unavailable. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => (typeof window === 'undefined' || !window.matchMedia ? () => {} : subscribe(query, onChange)),
    () => (typeof window === 'undefined' || !window.matchMedia ? false : window.matchMedia(query).matches),
    () => false,
  );
}

export interface SidenoteProps {
  number: number;
  /** The note. Keep it short and use inline content only (text, links, emphasis). */
  children: ReactNode;
  /** Viewport width at which notes move into the margin. */
  marginFrom?: string;
  className?: string;
}

export function Sidenote({ number, children, marginFrom = '(min-width: 1280px)', className }: SidenoteProps) {
  const wide = useMediaQuery(marginFrom);
  const [open, setOpen] = useState(false);
  const id = useId();

  if (wide) {
    const s = footnoteStyles({ placement: 'margin' });
    return (
      <>
        <sup className={s.marker()}>{number}</sup>
        <span role="note" className={s.note({ className })}>
          <span aria-hidden="true" className="mr-1 font-medium text-accent">
            {number}
          </span>
          {children}
        </span>
      </>
    );
  }

  const s = footnoteStyles({ placement: 'inline' });
  return (
    <>
      <sup className="align-baseline">
        <AriaButton className={s.toggle()} aria-expanded={open} aria-controls={id} aria-label={`Note ${number}`} onPress={() => setOpen((o) => !o)}>
          {number}
        </AriaButton>
      </sup>
      <span id={id} role="note" hidden={!open} className={open ? s.note({ className }) : undefined}>
        {children}
      </span>
    </>
  );
}
