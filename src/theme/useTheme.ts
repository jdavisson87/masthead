import { useSyncExternalStore } from 'react';
import { getServerThemeState, getThemeState, setTheme, subscribeToTheme, type ResolvedTheme, type Theme } from './theme';

export interface UseThemeResult {
  /** The user's choice: `light`, `dark`, or `system`. */
  theme: Theme;
  /** What is applied right now. Never `system`. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

export function useTheme(): UseThemeResult {
  const { theme, resolvedTheme } = useSyncExternalStore(subscribeToTheme, getThemeState, getServerThemeState);
  return { theme, resolvedTheme, setTheme };
}
