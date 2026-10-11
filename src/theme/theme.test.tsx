import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContrastToggle } from '../components/ThemeToggle/ContrastToggle';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
import {
  __resetThemeForTests,
  CONTRAST_STORAGE_KEY,
  setContrast,
  setTheme,
  themeInitScript,
  THEME_STORAGE_KEY,
} from './theme';
import { useTheme } from './useTheme';

interface SystemOptions {
  dark?: boolean;
  contrast?: boolean;
}

/** Fake `matchMedia` that answers per query and lets a test flip the OS settings. */
function mockSystem({ dark = false, contrast = false }: SystemOptions = {}) {
  const values = { dark, contrast };
  const listeners = new Set<() => void>();
  const keyFor = (query: string) => (query.includes('prefers-contrast') ? 'contrast' : 'dark');
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return values[keyFor(query)];
    },
    media: query,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia;
  return {
    setDark(next: boolean) {
      values.dark = next;
      listeners.forEach((listener) => listener());
    },
    setContrast(next: boolean) {
      values.contrast = next;
      listeners.forEach((listener) => listener());
    },
  };
}

const root = document.documentElement;

beforeEach(() => {
  window.localStorage.clear();
  root.classList.remove('dark', 'contrast');
  root.style.colorScheme = '';
  __resetThemeForTests();
});

afterEach(() => {
  __resetThemeForTests();
});

function Probe() {
  const { theme, resolvedTheme, contrast } = useTheme();
  return (
    <p>
      {theme}/{resolvedTheme}/{contrast ? 'contrast' : 'standard'}
    </p>
  );
}

describe('theme store', () => {
  it('defaults to system and resolves it from the OS preference', () => {
    mockSystem({ dark: true });
    render(<Probe />);
    expect(screen.getByText('system/dark/standard')).toBeInTheDocument();
    expect(root).toHaveClass('dark');
  });

  it('applies and persists an explicit choice', () => {
    mockSystem();
    render(<Probe />);
    act(() => setTheme('dark'));
    expect(screen.getByText('dark/dark/standard')).toBeInTheDocument();
    expect(root).toHaveClass('dark');
    expect(root.style.colorScheme).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    act(() => setTheme('light'));
    expect(root).not.toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('restores a stored choice and ignores invalid stored values', () => {
    mockSystem();
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const first = render(<Probe />);
    expect(screen.getByText('dark/dark/standard')).toBeInTheDocument();
    first.unmount();

    __resetThemeForTests();
    window.localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    render(<Probe />);
    expect(screen.getByText('system/light/standard')).toBeInTheDocument();
  });

  it('follows OS changes only while set to system', () => {
    const system = mockSystem();
    render(<Probe />);
    act(() => system.setDark(true));
    expect(screen.getByText('system/dark/standard')).toBeInTheDocument();

    act(() => setTheme('light'));
    act(() => system.setDark(false));
    act(() => system.setDark(true));
    expect(screen.getByText('light/light/standard')).toBeInTheDocument();
    expect(root).not.toHaveClass('dark');
  });
});

describe('increased contrast', () => {
  it('is off by default and follows the OS preference', () => {
    const system = mockSystem();
    render(<Probe />);
    expect(screen.getByText('system/light/standard')).toBeInTheDocument();
    expect(root).not.toHaveClass('contrast');

    act(() => system.setContrast(true));
    expect(screen.getByText('system/light/contrast')).toBeInTheDocument();
    expect(root).toHaveClass('contrast');
  });

  it('starts on when the OS already asks for more contrast', () => {
    mockSystem({ contrast: true });
    render(<Probe />);
    expect(root).toHaveClass('contrast');
  });

  it('an explicit choice persists and beats the OS preference', () => {
    const system = mockSystem({ contrast: true });
    render(<Probe />);
    act(() => setContrast(false));
    expect(root).not.toHaveClass('contrast');
    expect(window.localStorage.getItem(CONTRAST_STORAGE_KEY)).toBe('off');

    act(() => system.setContrast(false));
    act(() => system.setContrast(true));
    expect(root).not.toHaveClass('contrast');

    act(() => setContrast(true));
    expect(window.localStorage.getItem(CONTRAST_STORAGE_KEY)).toBe('more');
  });

  it('is independent of the light/dark choice', () => {
    mockSystem();
    render(<Probe />);
    act(() => setContrast(true));
    act(() => setTheme('dark'));
    expect(root).toHaveClass('dark', 'contrast');
    act(() => setTheme('light'));
    expect(root).toHaveClass('contrast');
    expect(root).not.toHaveClass('dark');
  });
});

describe('themeInitScript', () => {
  function run() {
    root.classList.remove('dark', 'contrast');
    new Function(themeInitScript)();
  }

  it('adds the dark class for a stored dark choice', () => {
    mockSystem();
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    run();
    expect(root).toHaveClass('dark');
    expect(root.style.colorScheme).toBe('dark');
  });

  it('lets a stored light choice beat a dark OS', () => {
    mockSystem({ dark: true });
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    run();
    expect(root).not.toHaveClass('dark');
  });

  it('falls back to the OS preference when nothing is stored', () => {
    mockSystem({ dark: true });
    run();
    expect(root).toHaveClass('dark');
  });
});

describe('themeInitScript contrast', () => {
  function run() {
    root.classList.remove('dark', 'contrast');
    new Function(themeInitScript)();
  }

  it('adds the contrast class from storage or from the OS', () => {
    mockSystem();
    window.localStorage.setItem(CONTRAST_STORAGE_KEY, 'more');
    run();
    expect(root).toHaveClass('contrast');

    window.localStorage.clear();
    mockSystem({ contrast: true });
    run();
    expect(root).toHaveClass('contrast');
  });

  it('lets a stored "off" beat the OS preference', () => {
    mockSystem({ contrast: true });
    window.localStorage.setItem(CONTRAST_STORAGE_KEY, 'off');
    run();
    expect(root).not.toHaveClass('contrast');
  });
});

describe('ContrastToggle', () => {
  it('toggles the contrast mode and persists it', async () => {
    mockSystem();
    const user = userEvent.setup();
    render(<ContrastToggle />);
    const control = screen.getByRole('switch', { name: 'Increase contrast' });
    expect(control).not.toBeChecked();
    await user.click(control);
    expect(control).toBeChecked();
    expect(root).toHaveClass('contrast');
    expect(window.localStorage.getItem(CONTRAST_STORAGE_KEY)).toBe('more');
  });

  it('reflects an OS-requested contrast as checked', () => {
    mockSystem({ contrast: true });
    render(<ContrastToggle />);
    expect(screen.getByRole('switch', { name: 'Increase contrast' })).toBeChecked();
  });

  it('has no axe violations', async () => {
    mockSystem();
    const { container } = render(<ContrastToggle />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});

describe('ThemeToggle', () => {
  it('renders a named group with the current choice checked', () => {
    mockSystem();
    render(<ThemeToggle />);
    expect(screen.getByRole('radiogroup', { name: 'Color theme' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked();
  });

  it('changes and persists the theme on click', async () => {
    mockSystem();
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(root).toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('cannot be emptied by clicking the selected option again', async () => {
    mockSystem();
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole('radio', { name: 'System' }));
    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
  });

  it('shows text labels when asked', () => {
    mockSystem();
    render(<ThemeToggle showLabels />);
    expect(screen.getByText('Light')).toBeVisible();
  });

  it('has no axe violations', async () => {
    mockSystem();
    const { container } = render(<ThemeToggle showLabels />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
