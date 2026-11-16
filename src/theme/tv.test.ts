import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { customThemeNames, tv } from './tv';
import { avatarStyles } from '../components/Avatar/Avatar';
import { kbdStyles } from '../components/Kbd/Kbd';
import { statStyles } from '../components/Stat/Stat';

// Read the source files directly (relative to the project root, where Vitest runs).
const css = readFileSync('src/styles.css', 'utf8') + readFileSync('src/theme/scale.css', 'utf8');

function tokenNames(namespace: string) {
  const names = [...css.matchAll(new RegExp(`--${namespace}-([a-z0-9-]+)\\s*:`, 'g'))]
    .map((m) => m[1]!)
    .filter((name) => !name.includes('--')); // skip companions such as --text-body-md--line-height
  return [...new Set(names)].sort();
}

const merge = (...classes: string[]) => tv({ base: classes.join(' ') })();

describe('tv', () => {
  it.each(Object.keys(customThemeNames) as (keyof typeof customThemeNames)[])(
    'knows every --%s-* token defined in the CSS',
    (namespace) => {
      expect([...customThemeNames[namespace]].sort()).toEqual(tokenNames(namespace));
    },
  );

  it('keeps a type-scale size and a text color together', () => {
    expect(merge('text-text', 'text-body-xs')).toBe('text-text text-body-xs');
    expect(merge('text-heading-lg', 'text-muted')).toBe('text-heading-lg text-muted');
  });

  it('lets a later size override an earlier one, built-in or custom', () => {
    expect(merge('text-sm', 'text-body-md')).toBe('text-body-md');
    expect(merge('text-body-sm', 'text-heading-lg')).toBe('text-heading-lg');
  });

  it('lets a later spacing class override an earlier one', () => {
    expect(merge('p-lg', 'p-sm')).toBe('p-sm');
    expect(merge('px-3', 'px-md')).toBe('px-md');
    expect(merge('gap-sm', 'gap-2')).toBe('gap-2');
  });

  it('merges the other custom names', () => {
    expect(merge('shadow-sm', 'shadow-popover')).toBe('shadow-popover');
    expect(merge('animate-spin', 'animate-ticker')).toBe('animate-ticker');
    expect(merge('tracking-wider', 'tracking-heading-tight')).toBe('tracking-heading-tight');
  });

  it('lets a later font size cancel an earlier leading-* (why components put leading after the size)', () => {
    expect(merge('leading-none', 'text-body-xs')).toBe('text-body-xs');
    expect(merge('text-body-xs', 'leading-none')).toBe('text-body-xs leading-none');
  });

  it.each(['sm', 'md'] as const)('keeps color, size and line height on %s Kbd keys', (size) => {
    const key = kbdStyles({ size }).key().split(' ');
    expect(key).toContain('text-text');
    expect(key).toContain('leading-none');
  });

  it.each(['md', 'lg'] as const)('keeps leading-none on the %s Stat value', (size) => {
    expect(statStyles({ size }).value().split(' ')).toContain('leading-none');
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('keeps leading-none on %s Avatar initials', (size) => {
    expect(avatarStyles({ size }).initials().split(' ')).toContain('leading-none');
  });
});
