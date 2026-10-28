import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Byline, formatBylineDate } from './Byline';

const ada = { name: 'Ada Lovelace', href: '/authors/ada' };
const grace = { name: 'Grace Hopper' };
const alan = { name: 'Alan Turing' };

describe('formatBylineDate', () => {
  it('reads a date-only string as that calendar day', () => {
    expect(formatBylineDate('2026-10-26')).toEqual({ text: 'October 26, 2026', iso: '2026-10-26' });
  });
  it('formats a Date as an ISO timestamp', () => {
    const d = new Date('2026-10-26T12:00:00Z');
    expect(formatBylineDate(d).iso).toBe('2026-10-26T12:00:00.000Z');
  });
  it('falls back to the raw value when invalid', () => {
    expect(formatBylineDate('soon').text).toBe('soon');
  });
});

describe('Byline', () => {
  it('lists one author', () => {
    render(<Byline authors={[grace]} />);
    expect(screen.getByText(/^By/)).toHaveTextContent('By Grace Hopper');
  });

  it('joins two and three authors in natural language', () => {
    const { rerender } = render(<Byline authors={[ada, grace]} />);
    expect(screen.getByText(/^By/)).toHaveTextContent('By Ada Lovelace and Grace Hopper');
    rerender(<Byline authors={[ada, grace, alan]} />);
    expect(screen.getByText(/^By/)).toHaveTextContent('By Ada Lovelace, Grace Hopper, and Alan Turing');
  });

  it('links authors that have an href', () => {
    render(<Byline authors={[ada, grace]} />);
    expect(screen.getByRole('link', { name: 'Ada Lovelace' })).toHaveAttribute('href', '/authors/ada');
    expect(screen.queryByRole('link', { name: 'Grace Hopper' })).not.toBeInTheDocument();
  });

  it('renders the date in a <time> element', () => {
    const { container } = render(<Byline authors={[ada]} date="2026-10-26" />);
    const time = container.querySelector('time');
    expect(time).toHaveAttribute('datetime', '2026-10-26');
    expect(time).toHaveTextContent('October 26, 2026');
  });

  it('shows publication and reading time, with spoken separators', () => {
    render(<Byline authors={[ada]} publication="Reuters" date="2026-10-26" readingMinutes={6} />);
    const p = screen.getByText(/^By/).closest('p') as HTMLElement;
    expect(p).toHaveTextContent('Reuters');
    expect(p).toHaveTextContent('6 min read');
    expect(p.querySelectorAll('.sr-only').length).toBe(3);
  });

  it('works without authors', () => {
    render(<Byline authors={[]} date="2026-10-26" />);
    expect(screen.queryByText(/^By/)).not.toBeInTheDocument();
    expect(screen.getByText('October 26, 2026')).toBeInTheDocument();
  });

  it('renders nothing when there is nothing to show', () => {
    const { container } = render(<Byline authors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('keeps avatars out of the accessibility tree', () => {
    render(<Byline authors={[ada, grace]} showAvatars />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Byline authors={[ada, grace]} publication="Reuters" date="2026-10-26" readingMinutes={6} showAvatars />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
