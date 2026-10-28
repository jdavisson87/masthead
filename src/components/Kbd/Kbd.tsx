import { useEffect, useRef, useState } from 'react';
import { tv } from 'tailwind-variants';

/**
 * Keyboard shortcut hints that adapt to the reader's platform ("mod" is ⌘ on a Mac and Ctrl elsewhere),
 * plus a hook that binds the same key list to a real shortcut so the hint and the behaviour cannot drift.
 * Each key shows a compact glyph; screen readers hear the full key name ("Command", "Control") and
 * "plus" between keys.
 */
export const kbdStyles = tv({
  slots: {
    group: 'inline-flex items-center gap-1 align-middle',
    key: 'inline-flex min-w-[1.5em] items-center justify-center rounded-sm border border-border-strong bg-raised px-1 font-mono font-medium leading-none text-text',
  },
  variants: {
    size: {
      sm: { key: 'h-5 text-[0.6875rem]' },
      md: { key: 'h-6 text-body-xs' },
    },
  },
  defaultVariants: { size: 'md' },
});

export type Platform = 'mac' | 'other';

type Glyphs = readonly [symbol: string, name: string];

const SHARED: Record<string, Glyphs> = {
  enter: ['↵', 'Enter'],
  esc: ['Esc', 'Escape'],
  backspace: ['⌫', 'Backspace'],
  delete: ['Del', 'Delete'],
  tab: ['⇥', 'Tab'],
  space: ['Space', 'Space'],
  up: ['↑', 'Up arrow'],
  down: ['↓', 'Down arrow'],
  left: ['←', 'Left arrow'],
  right: ['→', 'Right arrow'],
};
const MAC: Record<string, Glyphs> = {
  mod: ['⌘', 'Command'],
  ctrl: ['⌃', 'Control'],
  alt: ['⌥', 'Option'],
  shift: ['⇧', 'Shift'],
};
const OTHER: Record<string, Glyphs> = {
  mod: ['Ctrl', 'Control'],
  ctrl: ['Ctrl', 'Control'],
  alt: ['Alt', 'Alt'],
  shift: ['Shift', 'Shift'],
};

export function describeKey(key: string, platform: Platform): Glyphs {
  const k = key.toLowerCase();
  const found = (platform === 'mac' ? MAC : OTHER)[k] ?? SHARED[k];
  if (found) return found;
  const label = key.length === 1 ? key.toUpperCase() : key;
  return [label, label];
}

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other';
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform ?? nav.platform ?? '') ? 'mac' : 'other';
}

/** The reader's platform. Starts as "other" so server and first client render match, then updates. */
export function usePlatform(override?: Platform): Platform {
  const [platform, setPlatform] = useState<Platform>('other');
  useEffect(() => setPlatform(detectPlatform()), []);
  return override ?? platform;
}

export interface KbdProps {
  /** The keys in order, e.g. ["mod", "K"] or ["shift", "alt", "enter"]. Names are case-insensitive. */
  keys: string[];
  size?: 'sm' | 'md';
  /** Force a platform, mainly for docs and tests. */
  platform?: Platform;
  className?: string;
}

export function Kbd({ keys, size = 'md', platform, className }: KbdProps) {
  const p = usePlatform(platform);
  const s = kbdStyles({ size });
  return (
    <kbd className={s.group({ className })}>
      {keys.map((key, i) => {
        const [symbol, name] = describeKey(key, p);
        const plain = symbol === name;
        return (
          <kbd key={`${key}-${i}`} className={s.key()}>
            {i > 0 && <span className="sr-only">plus</span>}
            <span aria-hidden={plain ? undefined : true}>{symbol}</span>
            {!plain && <span className="sr-only">{name}</span>}
          </kbd>
        );
      })}
    </kbd>
  );
}

const EVENT_KEYS: Record<string, string> = { esc: 'escape', space: ' ', up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' };
const MODIFIERS = new Set(['mod', 'ctrl', 'alt', 'shift']);

export function matchesShortcut(event: KeyboardEvent, keys: string[], platform: Platform): boolean {
  const lower = keys.map((k) => k.toLowerCase());
  const main = lower.filter((k) => !MODIFIERS.has(k)).pop();
  if (!main) return false;
  const wantMeta = lower.includes('mod') && platform === 'mac';
  const wantCtrl = lower.includes('ctrl') || (lower.includes('mod') && platform !== 'mac');
  if (event.metaKey !== wantMeta || event.ctrlKey !== wantCtrl) return false;
  if (event.altKey !== lower.includes('alt') || event.shiftKey !== lower.includes('shift')) return false;
  return event.key.toLowerCase() === (EVENT_KEYS[main] ?? main);
}

export interface UseKeyboardShortcutOptions {
  enabled?: boolean;
  /** Fire even while typing in an input, textarea, select or contenteditable. Off by default. */
  allowInInputs?: boolean;
  platform?: Platform;
}

/** Run `handler` when the shortcut is pressed anywhere on the page. Pass the same `keys` you give <Kbd>. */
export function useKeyboardShortcut(keys: string[], handler: (event: KeyboardEvent) => void, options: UseKeyboardShortcutOptions = {}) {
  const { enabled = true, allowInInputs = false } = options;
  const platform = usePlatform(options.platform);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const keyList = keys.join('+');

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (!allowInInputs && target?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;
      if (!matchesShortcut(event, keyList.split('+'), platform)) return;
      event.preventDefault();
      handlerRef.current(event);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, allowInInputs, keyList, platform]);
}
