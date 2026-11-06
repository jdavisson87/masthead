import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { FootnoteRef, Footnotes, Sidenote, footnoteId, footnoteRefId } from './Footnote';

function mockWide(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('ids', () => {
  it('pairs reference and note ids', () => {
    expect(footnoteId(2)).toBe('fn-2');
    expect(footnoteRefId(2)).toBe('fnref-2');
    expect(footnoteId(2, 'a')).toBe('a-2');
  });
});

describe('FootnoteRef', () => {
  it('links to its note and is named for screen readers', () => {
    render(<FootnoteRef number={3} />);
    const link = screen.getByRole('link', { name: 'Footnote 3' });
    expect(link).toHaveAttribute('href', '#fn-3');
    expect(link).toHaveAttribute('id', 'fnref-3');
    expect(link).toHaveTextContent('3');
  });

  it('honours a prefix', () => {
    render(<FootnoteRef number={1} idPrefix="ch2" />);
    expect(screen.getByRole('link', { name: 'Footnote 1' })).toHaveAttribute('href', '#ch2-1');
  });
});

describe('Footnotes', () => {
  const notes = [
    { number: 1, children: 'First note.' },
    { number: 2, children: 'Second note.' },
  ];

  it('is a labelled section with an ordered list', () => {
    render(<Footnotes notes={notes} title="Notes" />);
    expect(screen.getByRole('region', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.getByRole('list').tagName).toBe('OL');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('gives each note the id its reference points to', () => {
    render(<Footnotes notes={notes} />);
    expect(screen.getByText('First note.').closest('li')).toHaveAttribute('id', 'fn-1');
  });

  it('adds a back-link to the reference', () => {
    render(<Footnotes notes={notes} />);
    expect(screen.getByRole('link', { name: 'Back to reference 2' })).toHaveAttribute('href', '#fnref-2');
  });

  it('uses the requested heading level', () => {
    render(<Footnotes notes={notes} headingLevel={3} title="References" />);
    expect(screen.getByRole('heading', { level: 3, name: 'References' })).toBeInTheDocument();
  });

  it('renders nothing without notes', () => {
    const { container } = render(<Footnotes notes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('works end to end with references', async () => {
    render(
      <>
        <p>
          The budget rose.
          <FootnoteRef number={1} />
        </p>
        <Footnotes notes={[{ number: 1, children: 'Audit figures.' }]} />
      </>,
    );
    expect(screen.getByRole('link', { name: 'Footnote 1' })).toHaveAttribute('href', `#${screen.getByText('Audit figures.').closest('li')!.id}`);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <main>
        <p>
          Text <FootnoteRef number={1} /> more <FootnoteRef number={2} />
        </p>
        <Footnotes notes={notes} />
      </main>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('Sidenote (narrow)', () => {
  it('starts closed with a labelled disclosure button', () => {
    mockWide(false);
    render(<p>Claim<Sidenote number={1}>Aside text.</Sidenote></p>);
    const button = screen.getByRole('button', { name: 'Note 1' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Aside text.')).not.toBeVisible();
  });

  it('opens and closes inline', async () => {
    mockWide(false);
    render(<p>Claim<Sidenote number={1}>Aside text.</Sidenote></p>);
    const button = screen.getByRole('button', { name: 'Note 1' });
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Aside text.')).toBeVisible();
    await userEvent.click(button);
    expect(screen.getByText('Aside text.')).not.toBeVisible();
  });

  it('points aria-controls at the note and works from the keyboard', async () => {
    mockWide(false);
    render(<p>Claim<Sidenote number={1}>Aside text.</Sidenote></p>);
    const button = screen.getByRole('button', { name: 'Note 1' });
    expect(button.getAttribute('aria-controls')).toBe(document.querySelector('[role="note"]')!.id);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('Aside text.')).toBeVisible();
  });

  it('has no axe violations open or closed', async () => {
    mockWide(false);
    const { container } = render(<main><p>Claim<Sidenote number={1}>Aside text.</Sidenote></p></main>);
    expect((await axe(container)).violations).toEqual([]);
    await userEvent.click(screen.getByRole('button', { name: 'Note 1' }));
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('Sidenote (wide)', () => {
  it('shows the note in the margin with no button', () => {
    mockWide(true);
    render(<p>Claim<Sidenote number={1}>Aside text.</Sidenote></p>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('Aside text.');
    expect(screen.getByRole('note')).toBeVisible();
  });

  it('has no axe violations', async () => {
    mockWide(true);
    const { container } = render(<main><p>Claim<Sidenote number={1}>Aside text.</Sidenote></p></main>);
    expect((await axe(container)).violations).toEqual([]);
  });
});
