import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
import { __resetThemeForTests, setTheme, themeInitScript, THEME_STORAGE_KEY } from './theme';
import { useTheme } from './useTheme';

function mockSystem(initialDark: boolean) {
  let dark = initialDark;
  const listeners = new Set<() => void>();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return dark;
    },
    media: query,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia;
  return {
    set(next: boolean) {
      dark = next;
      listeners.forEach((listener) => listener());
    },
  };
}

const root = document.documentElement;

beforeEach(() => {
  window.localStorage.clear();
  root.classList.remove('dark');
  root.style.colorScheme = '';
  __resetThemeForTests();
});

afterEach(() => {
  __resetThemeForTests();
});

function Probe() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <p>
      {theme}/{resolvedTheme}
    </p>
  );
}

describe('theme store', () => {
  it('defaults to system and resolves it from the OS preference', () => {
    mockSystem(true);
    render(<Probe />);
    expect(screen.getByText('system/dark')).toBeInTheDocument();
    expect(root).toHaveClass('dark');
  });

  it('applies and persists an explicit choice', () => {
    mockSystem(false);
    render(<Probe />);
    act(() => setTheme('dark'));
    expect(screen.getByText('dark/dark')).toBeInTheDocument();
    expect(root).toHaveClass('dark');
    expect(root.style.colorScheme).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    act(() => setTheme('light'));
    expect(root).not.toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('restores a stored choice and ignores invalid stored values', () => {
    mockSystem(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const first = render(<Probe />);
    expect(screen.getByText('dark/dark')).toBeInTheDocument();
    first.unmount();

    __resetThemeForTests();
    window.localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    render(<Probe />);
    expect(screen.getByText('system/light')).toBeInTheDocument();
  });

  it('follows OS changes only while set to system', () => {
    const system = mockSystem(false);
    render(<Probe />);
    act(() => system.set(true));
    expect(screen.getByText('system/dark')).toBeInTheDocument();

    act(() => setTheme('light'));
    act(() => system.set(false));
    act(() => system.set(true));
    expect(screen.getByText('light/light')).toBeInTheDocument();
    expect(root).not.toHaveClass('dark');
  });
});

describe('themeInitScript', () => {
  function run() {
    root.classList.remove('dark');
    new Function(themeInitScript)();
  }

  it('adds the dark class for a stored dark choice', () => {
    mockSystem(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    run();
    expect(root).toHaveClass('dark');
    expect(root.style.colorScheme).toBe('dark');
  });

  it('lets a stored light choice beat a dark OS', () => {
    mockSystem(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    run();
    expect(root).not.toHaveClass('dark');
  });

  it('falls back to the OS preference when nothing is stored', () => {
    mockSystem(true);
    run();
    expect(root).toHaveClass('dark');
  });
});

describe('ThemeToggle', () => {
  it('renders a named group with the current choice checked', () => {
    mockSystem(false);
    render(<ThemeToggle />);
    expect(screen.getByRole('radiogroup', { name: 'Color theme' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked();
  });

  it('changes and persists the theme on click', async () => {
    mockSystem(false);
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(root).toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('cannot be emptied by clicking the selected option again', async () => {
    mockSystem(false);
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole('radio', { name: 'System' }));
    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
  });

  it('shows text labels when asked', () => {
    mockSystem(false);
    render(<ThemeToggle showLabels />);
    expect(screen.getByText('Light')).toBeVisible();
  });

  it('has no axe violations', async () => {
    mockSystem(false);
    const { container } = render(<ThemeToggle showLabels />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
