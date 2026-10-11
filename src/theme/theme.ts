/**
 * Theme store: a tiny external store (no provider needed) that owns the user's
 * light / dark / system preference and the increased-contrast setting, persists
 * both, and keeps `.dark` / `.contrast` on <html> in sync, including when the OS
 * preference changes or another tab updates a setting.
 */

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEMES: readonly Theme[] = ['light', 'system', 'dark'];
export const THEME_STORAGE_KEY = 'masthead-theme';
export const CONTRAST_STORAGE_KEY = 'masthead-contrast';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const CONTRAST_QUERY = '(prefers-contrast: more)';

/** `more` / `off` are explicit user choices; `system` follows the OS until the user chooses. */
type ContrastChoice = 'more' | 'off' | 'system';

export interface ThemeState {
  /** What the user chose. */
  theme: Theme;
  /** What is actually applied: `system` resolved against the OS preference. */
  resolvedTheme: ResolvedTheme;
  /** Whether increased contrast is applied (user choice, else the OS preference). */
  contrast: boolean;
}

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

let state: ThemeState | undefined;
let contrastChoice: ContrastChoice = 'system';
let detach: (() => void) | undefined;
const listeners = new Set<() => void>();

function matches(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(query).matches;
}

function readStored(): Theme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : 'system';
  } catch {
    return 'system'; // storage blocked (private mode, sandboxed iframe)
  }
}

function readStoredContrast(): ContrastChoice {
  try {
    const value = window.localStorage.getItem(CONTRAST_STORAGE_KEY);
    return value === 'more' || value === 'off' ? value : 'system';
  } catch {
    return 'system';
  }
}

function build(theme: Theme, choice: ContrastChoice): ThemeState {
  return {
    theme,
    resolvedTheme: theme === 'system' ? (matches(DARK_QUERY) ? 'dark' : 'light') : theme,
    contrast: choice === 'system' ? matches(CONTRAST_QUERY) : choice === 'more',
  };
}

function applyToDocument({ resolvedTheme, contrast }: ThemeState) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', resolvedTheme === 'dark');
  root.classList.toggle('contrast', contrast);
  root.style.colorScheme = resolvedTheme;
}

function commit(theme: Theme, choice: ContrastChoice) {
  contrastChoice = choice;
  state = build(theme, choice);
  applyToDocument(state);
  listeners.forEach((listener) => listener());
}

/** Current snapshot. Stable between changes, as `useSyncExternalStore` requires. */
export function getThemeState(): ThemeState {
  if (!state) {
    if (typeof window === 'undefined') return SERVER_STATE;
    contrastChoice = readStoredContrast();
    state = build(readStored(), contrastChoice);
  }
  return state;
}

/** Server snapshot: nothing is known about the viewer, so assume system / light / standard contrast. */
export function getServerThemeState(): ThemeState {
  return SERVER_STATE;
}
const SERVER_STATE: ThemeState = { theme: 'system', resolvedTheme: 'light', contrast: false };

/** Choose a theme. `system` follows the OS and keeps following it. */
export function setTheme(theme: Theme) {
  getThemeState(); // make sure the contrast choice is loaded first
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* the choice still applies for this page view */
  }
  commit(theme, contrastChoice);
}

/** Turn increased contrast on or off. An explicit choice overrides the OS preference. */
export function setContrast(on: boolean) {
  const { theme } = getThemeState();
  const choice: ContrastChoice = on ? 'more' : 'off';
  try {
    window.localStorage.setItem(CONTRAST_STORAGE_KEY, choice);
  } catch {
    /* the choice still applies for this page view */
  }
  commit(theme, choice);
}

function attach() {
  const canMatch = typeof window.matchMedia === 'function';
  const darkMedia = canMatch ? window.matchMedia(DARK_QUERY) : undefined;
  const contrastMedia = canMatch ? window.matchMedia(CONTRAST_QUERY) : undefined;

  const onDarkChange = () => {
    const { theme } = getThemeState();
    if (theme === 'system') commit(theme, contrastChoice);
  };
  const onContrastChange = () => {
    if (contrastChoice === 'system') commit(getThemeState().theme, contrastChoice);
  };
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === THEME_STORAGE_KEY ||
      event.key === CONTRAST_STORAGE_KEY ||
      event.key === null
    ) {
      commit(readStored(), readStoredContrast());
    }
  };

  darkMedia?.addEventListener('change', onDarkChange);
  contrastMedia?.addEventListener('change', onContrastChange);
  window.addEventListener('storage', onStorage);
  applyToDocument(getThemeState()); // covers pages without the init script
  return () => {
    darkMedia?.removeEventListener('change', onDarkChange);
    contrastMedia?.removeEventListener('change', onContrastChange);
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
  contrastChoice = 'system';
}

/**
 * Inline this in <head> (before any stylesheet or app code) to set theme and contrast
 * before first paint, so nobody sees a flash of the wrong theme.
 *
 *   <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
 */
const q = JSON.stringify;
export const themeInitScript =
  `(function(){try{` +
  `var t=null,c=null;` +
  `try{t=localStorage.getItem(${q(THEME_STORAGE_KEY)});c=localStorage.getItem(${q(CONTRAST_STORAGE_KEY)})}catch(e){}` +
  `var d=t==="dark"||(t!=="light"&&matchMedia(${q(DARK_QUERY)}).matches);` +
  `var h=c==="more"||(c!=="off"&&matchMedia(${q(CONTRAST_QUERY)}).matches);` +
  `var r=document.documentElement;` +
  `if(d){r.classList.add("dark")}if(h){r.classList.add("contrast")}` +
  `r.style.colorScheme=d?"dark":"light"` +
  `}catch(e){}})();`;
