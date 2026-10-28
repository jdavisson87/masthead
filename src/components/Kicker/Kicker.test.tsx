import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Kicker } from './Kicker';

describe('Kicker', () => {
  it('renders its text in a paragraph by default', () => {
    render(<Kicker>Analysis</Kicker>);
    expect(screen.getByText('Analysis').tagName).toBe('P');
  });

  it.each(['span', 'div'] as const)('can render as %s', (as) => {
    render(<Kicker as={as}>Live</Kicker>);
    expect(screen.getByText('Live').tagName).toBe(as.toUpperCase());
  });

  it('applies the tone', () => {
    render(<Kicker tone="muted">Opinion</Kicker>);
    expect(screen.getByText('Opinion')).toHaveClass('text-muted');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <article>
        <Kicker>Politics</Kicker>
        <h2>Council approves budget</h2>
      </article>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
