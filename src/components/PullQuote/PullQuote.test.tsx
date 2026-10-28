import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PullQuote } from './PullQuote';

describe('PullQuote', () => {
  it('is a figure containing a blockquote', () => {
    render(<PullQuote>Weekend service is the whole point.</PullQuote>);
    expect(screen.getByRole('figure')).toBeInTheDocument();
    expect(screen.getByRole('blockquote')).toHaveTextContent('Weekend service is the whole point.');
  });

  it('captions the figure with the attribution and a <cite> source', () => {
    const { container } = render(
      <PullQuote attribution="Jane Doe, chair" source="Budget hearing">
        Quote.
      </PullQuote>,
    );
    expect(container.querySelector('figcaption')).toHaveTextContent('Jane Doe, chair');
    expect(container.querySelector('cite')).toHaveTextContent('Budget hearing');
  });

  it('exposes the source url as the blockquote cite attribute', () => {
    render(<PullQuote citeUrl="https://example.com/hearing">Quote.</PullQuote>);
    expect(screen.getByRole('blockquote')).toHaveAttribute('cite', 'https://example.com/hearing');
  });

  it('hides decorative quotation marks from assistive tech', () => {
    const { container } = render(<PullQuote>Quote.</PullQuote>);
    const marks = container.querySelectorAll('[aria-hidden="true"]');
    expect(Array.from(marks).map((m) => m.textContent)).toEqual(['“', '”']);
  });

  it('omits the caption when there is no attribution or source', () => {
    const { container } = render(<PullQuote>Quote.</PullQuote>);
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('drops the rule when centered', () => {
    render(<PullQuote align="center">Quote.</PullQuote>);
    expect(screen.getByRole('figure')).toHaveClass('text-center');
    expect(screen.getByRole('figure')).not.toHaveClass('pl-lg');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <PullQuote attribution="Jane Doe" source="Hearing" citeUrl="https://example.com">
          Quote.
        </PullQuote>
        <PullQuote size="lg" align="center">
          Another.
        </PullQuote>
      </>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
