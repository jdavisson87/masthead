import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Button } from '../Button/Button';
import { Spinner, type SpinnerProps } from './Spinner';

describe('Spinner', () => {
  it('is a progressbar named "Loading" with no value', () => {
    render(<Spinner />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('takes a custom accessible name', () => {
    render(<Spinner label="Loading orders" />);
    expect(screen.getByRole('progressbar', { name: 'Loading orders' })).toBeInTheDocument();
  });

  it('shows the label only when asked', () => {
    const { rerender } = render(<Spinner label="Loading orders" />);
    expect(screen.queryByText('Loading orders')).not.toBeInTheDocument();

    rerender(<Spinner label="Loading orders" showLabel />);
    expect(screen.getByText('Loading orders')).toBeVisible();
  });

  it('keeps the ring out of the accessibility tree', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('spins, and stops with reduced motion', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toHaveClass('animate-spin', 'motion-reduce:animate-none');
  });

  it.each([
    ['xs', 'size-3.5'],
    ['sm', 'size-4'],
    ['md', 'size-6'],
    ['lg', 'size-10'],
  ] as const)('sizes the %s ring', (size, expected) => {
    const { container } = render(<Spinner size={size} />);
    expect(container.querySelector('svg')).toHaveClass(expected);
  });

  it.each([
    ['accent', 'text-accent'],
    ['muted', 'text-muted'],
    ['current', 'text-current'],
  ] as const)('colors the %s tone', (tone, expected) => {
    const { container } = render(<Spinner tone={tone} />);
    expect(container.querySelector('svg')).toHaveClass(expected);
  });

  it('can be decorative: hidden from assistive tech, so it is not announced twice', () => {
    const { container } = render(<Spinner decorative />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each<[string, Partial<SpinnerProps>]>([
    ['default', {}],
    ['labelled', { label: 'Loading orders', showLabel: true }],
    ['large muted', { size: 'lg', tone: 'muted' }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(<Spinner {...props} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when decorative inside a button', async () => {
    const { container } = render(
      <Button isDisabled>
        <Spinner decorative size="sm" tone="current" />
        Saving…
      </Button>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });
});
