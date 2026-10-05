import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('turns the animation off for reduced motion', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveClass('animate-pulse', 'motion-reduce:animate-none');
  });

  it('lets a custom size override the default', () => {
    const { container } = render(<Skeleton className="h-8 w-1/2" />);
    expect(container.firstElementChild).toHaveClass('h-8', 'w-1/2');
    expect(container.firstElementChild).not.toHaveClass('h-4');
  });

  it.each(['text', 'block'] as const)('has no axe violations (%s)', async (shape) => {
    const { container } = render(
      <div aria-busy="true">
        <Skeleton shape={shape} />
      </div>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
