import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Delta, formatDeltaValue, getDeltaDirection, getDeltaSentiment } from './Delta';
import { Stat } from './Stat';

describe('delta helpers', () => {
  it('finds direction', () => {
    expect(getDeltaDirection(3)).toBe('up');
    expect(getDeltaDirection(-3)).toBe('down');
    expect(getDeltaDirection(0)).toBe('flat');
  });
  it('judges sentiment, flipping it when lower is better', () => {
    expect(getDeltaSentiment(5)).toBe('good');
    expect(getDeltaSentiment(-5)).toBe('bad');
    expect(getDeltaSentiment(5, true)).toBe('bad');
    expect(getDeltaSentiment(-5, true)).toBe('good');
    expect(getDeltaSentiment(0, true)).toBe('neutral');
  });
  it('formats percent and number changes without a sign', () => {
    expect(formatDeltaValue(-12.5, 'percent', 1, 'en-US')).toBe('12.5%');
    expect(formatDeltaValue(-1200.5, 'number', 0, 'en-US')).toBe('1,201');
  });
});

describe('Delta', () => {
  it('reads direction and size aloud', () => {
    render(<Delta value={12.5} />);
    expect(screen.getByText('Up 12.5%')).toHaveClass('sr-only');
  });

  it('reads a decrease as Down', () => {
    render(<Delta value={-3} />);
    expect(screen.getByText('Down 3%')).toBeInTheDocument();
  });

  it('reads zero as no change', () => {
    render(<Delta value={0} />);
    expect(screen.getByText('No change')).toBeInTheDocument();
  });

  it('says "versus" for "vs" and shows the period visually', () => {
    render(<Delta value={4} period="vs last month" />);
    expect(screen.getByText('Up 4% versus last month')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toHaveAttribute('aria-hidden', 'true');
  });

  it('hides the visual arrow and number from assistive tech', () => {
    const { container } = render(<Delta value={4} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('4%');
  });

  it('colors by whether the change is good', () => {
    const { container, rerender } = render(<Delta value={4} />);
    expect(container.querySelector('.text-success')).not.toBeNull();
    rerender(<Delta value={4} invert />);
    expect(container.querySelector('.text-danger')).not.toBeNull();
    rerender(<Delta value={0} />);
    expect(container.querySelector('.text-muted')).not.toBeNull();
  });

  it('supports plain numbers and a custom formatter', () => {
    const { rerender } = render(<Delta value={1500} format="number" precision={0} />);
    expect(screen.getByText('Up 1,500')).toBeInTheDocument();
    rerender(<Delta value={2} formatValue={(n) => `${n} pts`} />);
    expect(screen.getByText('Up 2 pts')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Delta value={4} period="vs last month" />
        <Delta value={-4} invert />
        <Delta value={0} />
      </>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('Stat', () => {
  it('pairs a label with its value in a description list', () => {
    const { container } = render(<Stat label="Revenue" value="$48,200" />);
    expect(container.querySelector('dt')).toHaveTextContent('Revenue');
    expect(container.querySelector('dd')).toHaveTextContent('$48,200');
  });

  it('shows the change and its period', () => {
    render(<Stat label="Revenue" value="$48,200" delta={12.5} period="vs last month" />);
    expect(screen.getByText('Up 12.5% versus last month')).toBeInTheDocument();
  });

  it('adds a named trend line', () => {
    render(<Stat label="Revenue" value="$48,200" trend={[1, 2, 3]} />);
    expect(screen.getByRole('img', { name: /^Revenue trend: 3 values/ })).toBeInTheDocument();
  });

  it('uses a custom trend label', () => {
    render(<Stat label="Revenue" value="$48,200" trend={[1, 2, 3]} trendLabel="Weekly revenue" />);
    expect(screen.getByRole('img', { name: /^Weekly revenue: / })).toBeInTheDocument();
  });

  it('colors the trend by whether the change is good', () => {
    const { container } = render(<Stat label="Errors" value="12" delta={20} invertDelta trend={[1, 2, 3]} />);
    expect(container.querySelector('svg.text-danger')).not.toBeNull();
  });

  it('shows a hint', () => {
    render(<Stat label="Revenue" value="$48,200" hint="Updated 5 minutes ago" />);
    expect(screen.getByText('Updated 5 minutes ago')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Stat label="Revenue" value="$48,200" delta={12.5} period="vs last month" trend={[3, 5, 4, 8]} hint="Updated now" size="lg" />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
