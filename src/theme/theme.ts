/**
 * Theme store: a tiny external store (no provider needed) that owns the user's
 * light / dark / system preference, persists it, and keeps the `.dark` class
 * on <html> in sync, including when the OS preference changes or another tab
 * updates the setting.
 */

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEMES: readonly Theme[] = ['light', 'system', 'dark'];
export const THEME_STORAGE_KEY = 'masthead-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

export interface ThemeState {
  /** What the user chose. */
  theme: Theme;
  /** What is actually applied: `system` resolved against the OS preference. */
  resolvedTheme: ResolvedTheme;
}

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

let state: ThemeState | undefined;
let detach: (() => void) | undefined;
const listeners = new Set<() => void>();

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

function readStored(): Theme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : 'system';
  } catch {
    return 'system'; // storage blocked (private mode, sandboxed iframe)
  }
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === 'system' ? systemTheme() : theme;
}

function applyToDocument(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function commit(theme: Theme) {
  state = { theme, resolvedTheme: resolve(theme) };
  applyToDocument(state.resolvedTheme);
  emit();
}

/** Current snapshot. Stable between changes, as `useSyncExternalStore` requires. */
export function getThemeState(): ThemeState {
  if (!state) {
    const theme = typeof window === 'undefined' ? 'system' : readStored();
    state = { theme, resolvedTheme: resolve(theme) };
  }
  return state;
}

/** Server snapshot: nothing is known about the viewer, so assume system / light. */
export function getServerThemeState(): ThemeState {
  return SERVER_STATE;
}
const SERVER_STATE: ThemeState = { theme: 'system', resolvedTheme: 'light' };

/** Choose a theme. `system` follows the OS and keeps following it. */
export function setTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* the choice still applies for this page view */
  }
  commit(theme);
}

function attach() {
  const media = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : undefined;
  const onSystemChange = () => {
    if (getThemeState().theme === 'system') commit('system');
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) commit(readStored());
  };
  media?.addEventListener('change', onSystemChange);
  window.addEventListener('storage', onStorage);
  applyToDocument(getThemeState().resolvedTheme); // covers pages without the init script
  return () => {
    media?.removeEventListener('change', onSystemChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function subscribeToTheme(listener: () => void) {
  if (listeners.size === 0) detach = attach();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      detach?.();
      detach = undefined;
    }
  };
}

/** Test helper: forget cached state and listeners. Not part of the public API. */
export function __resetThemeForTests() {
  detach?.();
  detach = undefined;
  listeners.clear();
  state = undefined;
}

/**
 * Inline this in <head> (before any stylesheet or app code) to set the theme
 * before first paint, so a dark-mode user never sees a light flash.
 *
 *   <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
 */
export const themeInitScript = `(function(){try{var t=null;try{t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})}catch(e){}var d=t==="dark"||(t!=="light"&&window.matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches);var r=document.documentElement;if(d){r.classList.add("dark")}r.style.colorScheme=d?"dark":"light"}catch(e){}})();`;
