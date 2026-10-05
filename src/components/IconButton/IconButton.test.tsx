import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { IconButton } from './IconButton';

const Icon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3l10 10M13 3L3 13" />
  </svg>
);

describe('IconButton', () => {
  it('is named by its aria-label', () => {
    render(
      <IconButton aria-label="Close">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('hides the icon from assistive technology', () => {
    const { container } = render(
      <IconButton aria-label="Close">
        <Icon />
      </IconButton>,
    );
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it('calls onPress when clicked', async () => {
    const onPress = vi.fn();
    render(
      <IconButton aria-label="Close" onPress={onPress}>
        <Icon />
      </IconButton>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each(['{Enter}', ' '])('is activatable from the keyboard (%j)', async (key) => {
    const onPress = vi.fn();
    render(
      <IconButton aria-label="Close" onPress={onPress}>
        <Icon />
      </IconButton>,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    await userEvent.keyboard(key);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', async () => {
    const onPress = vi.fn();
    render(
      <IconButton aria-label="Close" onPress={onPress} isDisabled>
        <Icon />
      </IconButton>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('requires an aria-label at the type level', () => {
    const missing = () => {
      // @ts-expect-error aria-label is required
      return <IconButton>x</IconButton>;
    };
    expect(missing).toBeTypeOf('function');
  });

  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)('has no axe violations (%s)', async (intent) => {
    const { container } = render(
      <IconButton aria-label="Close" intent={intent}>
        <Icon />
      </IconButton>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
