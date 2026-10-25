import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ProgressBar, type ProgressBarProps } from './ProgressBar';

const fill = (container: HTMLElement) => container.querySelector('[data-fill]') as HTMLElement;

describe('ProgressBar', () => {
  it('is a named progressbar with its value', () => {
    render(<ProgressBar label="Uploading" value={40} />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuetext', '40%');
  });

  it('shows the value as text and sizes the fill to match', () => {
    const { container } = render(<ProgressBar label="Uploading" value={40} />);
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(fill(container).style.width).toBe('40%');
  });

  it('works out the percentage from a custom range', () => {
    const { container } = render(<ProgressBar label="Disk" value={50} minValue={0} maxValue={200} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '25%');
    expect(fill(container).style.width).toBe('25%');
  });

  it('uses a custom value label', () => {
    render(<ProgressBar label="Files" value={3} maxValue={10} valueLabel="3 of 10 files" />);
    expect(screen.getByText('3 of 10 files')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '3 of 10 files');
  });

  it('can hide the value text', () => {
    render(<ProgressBar label="Uploading" value={40} showValue={false} />);
    expect(screen.queryByText('40%')).not.toBeInTheDocument();
  });

  it('keeps the label for assistive tech when visually hidden', () => {
    render(<ProgressBar label="Page load" value={40} hideLabel />);
    expect(screen.getByRole('progressbar', { name: 'Page load' })).toBeInTheDocument();
    expect(screen.getByText('Page load')).toHaveClass('sr-only');
  });

  it('is indeterminate with no value and no value text', () => {
    const { container } = render(<ProgressBar label="Preparing" isIndeterminate />);
    const bar = screen.getByRole('progressbar', { name: 'Preparing' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(fill(container)).toHaveClass('animate-progress-indeterminate', 'motion-reduce:animate-none');
  });

  it.each([
    ['accent', 'bg-accent'],
    ['success', 'bg-success'],
    ['danger', 'bg-danger'],
  ] as const)('colors the fill for the %s tone', (tone, expected) => {
    const { container } = render(<ProgressBar label="Task" value={50} tone={tone} />);
    expect(fill(container)).toHaveClass(expected);
  });

  it.each([
    ['sm', 'h-2'],
    ['md', 'h-3'],
    ['lg', 'h-4'],
  ] as const)('sizes the %s track', (size, expected) => {
    const { container } = render(<ProgressBar label="Task" value={50} size={size} />);
    expect(fill(container).parentElement).toHaveClass(expected);
  });

  it.each<[string, Partial<ProgressBarProps>]>([
    ['determinate', { value: 40 }],
    ['indeterminate', { isIndeterminate: true }],
    ['hidden label', { value: 40, hideLabel: true }],
    ['success', { value: 100, tone: 'success' }],
    ['custom range', { value: 3, maxValue: 10, valueLabel: '3 of 10' }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(<ProgressBar label="Task" {...props} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
