import { useSyncExternalStore } from 'react';
import {
  getServerThemeState,
  getThemeState,
  setContrast,
  setTheme,
  subscribeToTheme,
  type ResolvedTheme,
  type Theme,
} from './theme';

export interface UseThemeResult {
  /** The user's choice: `light`, `dark`, or `system`. */
  theme: Theme;
  /** What is applied right now. Never `system`. */
  resolvedTheme: ResolvedTheme;
  /** Whether increased contrast is applied. */
  contrast: boolean;
  setTheme: (theme: Theme) => void;
  setContrast: (on: boolean) => void;
}

export function useTheme(): UseThemeResult {
  const { theme, resolvedTheme, contrast } = useSyncExternalStore(subscribeToTheme, getThemeState, getServerThemeState);
  return { theme, resolvedTheme, contrast, setTheme, setContrast };
}
