import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Separator } from './Separator';

describe('Separator', () => {
  it('is announced as a separator by default', () => {
    render(<Separator />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('is horizontal by default and says so only when vertical', () => {
    const { rerender } = render(<Separator />);
    expect(screen.getByRole('separator')).not.toHaveAttribute('aria-orientation', 'vertical');

    rerender(<Separator orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it.each([
    ['horizontal', 'thin', 'h-px'],
    ['horizontal', 'thick', 'h-0.5'],
    ['vertical', 'thin', 'w-px'],
    ['vertical', 'thick', 'w-0.5'],
  ] as const)('sizes a %s %s rule', (orientation, weight, expected) => {
    render(<Separator orientation={orientation} weight={weight} />);
    expect(screen.getByRole('separator')).toHaveClass(expected);
  });

  it.each([
    ['subtle', 'bg-border'],
    ['strong', 'bg-border-strong'],
    ['ink', 'bg-text'],
  ] as const)('colors the %s tone', (tone, expected) => {
    render(<Separator tone={tone} />);
    expect(screen.getByRole('separator')).toHaveClass(expected);
  });

  it('resets the default <hr> look so it works without a CSS reset', () => {
    render(<Separator />);
    expect(screen.getByRole('separator')).toHaveClass('border-0', 'm-0');
  });

  it('merges a custom className', () => {
    render(<Separator className="my-8" />);
    expect(screen.getByRole('separator')).toHaveClass('my-8');
  });

  it('hides a decorative rule from assistive tech', () => {
    render(<Separator decorative />);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    expect(document.querySelector('[role="none"]')).toBeInTheDocument();
  });

  it.each([
    ['default', {}],
    ['vertical', { orientation: 'vertical' as const }],
    ['ink and thick', { tone: 'ink' as const, weight: 'thick' as const }],
    ['decorative', { decorative: true }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(
      <div>
        <p>Above</p>
        <Separator {...props} />
        <p>Below</p>
      </div>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
