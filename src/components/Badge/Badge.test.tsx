import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge>Beta</Badge>);
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('merges a custom className', () => {
    render(<Badge className="custom-class">Beta</Badge>);
    expect(screen.getByText('Beta')).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Badge data-testid="status">Live</Badge>);
    expect(screen.getByTestId('status')).toHaveTextContent('Live');
  });

  it.each(['neutral', 'accent', 'success', 'danger'] as const)('has no axe violations (%s)', async (tone) => {
    const { container } = render(<Badge tone={tone}>Status</Badge>);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
