import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Link, RouterProvider } from './Link';

describe('Link', () => {
  it('renders an anchor with its href', () => {
    render(<Link href="/docs">Docs</Link>);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
  });

  it('reports presses', async () => {
    const onPress = vi.fn();
    render(
      <Link href="#section" onPress={onPress}>
        Jump
      </Link>,
    );
    await userEvent.click(screen.getByRole('link', { name: 'Jump' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('without an href is a focusable link that runs on Enter', async () => {
    const onPress = vi.fn();
    render(<Link onPress={onPress}>Show more</Link>);
    const link = screen.getByRole('link', { name: 'Show more' });
    expect(link.tagName).not.toBe('A');
    await userEvent.tab();
    expect(link).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  describe('opening in a new tab', () => {
    it('adds a safe rel, a screen-reader note and a hidden icon', () => {
      render(
        <Link href="https://example.com" target="_blank">
          Example
        </Link>,
      );
      const link = screen.getByRole('link', { name: 'Example, opens in a new tab' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('lets you override rel', () => {
      render(
        <Link href="https://example.com" target="_blank" rel="noopener">
          Example
        </Link>,
      );
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener');
    });

    it('adds none of that for a normal link', () => {
      render(<Link href="/docs">Docs</Link>);
      const link = screen.getByRole('link', { name: 'Docs' });
      expect(link).not.toHaveAttribute('rel');
      expect(link.querySelector('svg')).toBeNull();
    });
  });

  it('is disabled and does not fire', async () => {
    const onPress = vi.fn();
    render(
      <Link href="#x" isDisabled onPress={onPress}>
        Nope
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Nope' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(link);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('marks the current page', () => {
    render(
      <Link href="#home" aria-current="page">
        Home
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveAttribute('data-current', 'true');
  });

  it('navigates through the router instead of the browser', async () => {
    const navigate = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <Link href="/dashboard">Dashboard</Link>
      </RouterProvider>,
    );
    await userEvent.click(screen.getByRole('link', { name: 'Dashboard' }));
    expect(navigate.mock.calls[0]?.[0]).toBe('/dashboard');
  });

  it.each([
    ['inline', { intent: 'inline' as const }],
    ['subtle', { intent: 'subtle' as const }],
    ['external', { target: '_blank' }],
    ['disabled', { isDisabled: true }],
    ['current', { 'aria-current': 'page' as const }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(
      <p>
        Read the{' '}
        <Link href="#docs" {...props}>
          documentation
        </Link>{' '}
        first.
      </p>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
