import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Guards the palette: parses the real token blocks out of styles.css, rebuilds each
 * theme the way the cascade does, and checks WCAG contrast ratios. A token edit that
 * breaks a threshold fails here, not in front of a user.
 */

// Read the file directly: Vite's CSS pipeline would hand us compiled output, not the source tokens.
const css = readFileSync('src/styles.css', 'utf8'); // relative to the project root, where Vitest runs

type Tokens = Record<string, string>;

function block(selector: string): Tokens {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`).exec(css);
  if (!match?.[1]) throw new Error(`No ${selector} block in styles.css`);
  const tokens: Tokens = {};
  for (const [, name, value] of match[1].matchAll(/--ds-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    if (name && value) tokens[name] = value;
  }
  return tokens;
}

const root = block(':root');
const dark = block('.dark');
const contrast = block('.contrast');
const contrastDark = block('.contrast.dark');

// Same order as the cascade: later blocks override earlier ones.
const themes: Record<string, Tokens> = {
  light: root,
  dark: { ...root, ...dark },
  'light + contrast': { ...root, ...contrast },
  'dark + contrast': { ...root, ...dark, ...contrast, ...contrastDark },
};

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a: string | undefined, b: string | undefined) {
  if (!a || !b) throw new Error('Missing token');
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const surfaces = ['bg', 'surface', 'raised', 'overlay', 'overlay-hover'] as const;

// Minimum ratio per foreground token: standard themes vs. increased contrast (AAA).
const minimums: Record<string, { standard: number; contrast: number }> = {
  text: { standard: 7, contrast: 7 },
  muted: { standard: 4.5, contrast: 7 },
  accent: { standard: 4.5, contrast: 7 },
  danger: { standard: 4.5, contrast: 7 },
  success: { standard: 4.5, contrast: 7 },
  'border-strong': { standard: 3, contrast: 7 },
};

describe.each(Object.entries(themes))('%s palette', (name, tokens) => {
  const level = name.includes('contrast') ? 'contrast' : 'standard';

  it.each(Object.entries(minimums))('%s meets its minimum on every surface', (token, min) => {
    for (const surface of surfaces) {
      expect(ratio(tokens[token], tokens[surface]), `${token} on ${surface}`).toBeGreaterThanOrEqual(min[level]);
    }
  });

  it('keeps accent-fg readable on accent and accent-hover', () => {
    const min = level === 'contrast' ? 7 : 4.5;
    expect(ratio(tokens['accent-fg'], tokens['accent'])).toBeGreaterThanOrEqual(min);
    expect(ratio(tokens['accent-fg'], tokens['accent-hover'])).toBeGreaterThanOrEqual(min);
  });

  if (name.startsWith('dark')) {
    // Shadows don't show on near-black, so a floating layer's edge must be visible on its own.
    it('gives floating layers a visible edge against the page', () => {
      const min = level === 'contrast' ? 4.5 : 3;
      expect(ratio(tokens['overlay-border'], tokens['bg'])).toBeGreaterThanOrEqual(min);
    });
  }

  if (level === 'contrast') {
    it('makes even the decorative border clearly visible', () => {
      expect(ratio(tokens['border'], tokens['bg'])).toBeGreaterThanOrEqual(4.5);
      expect(ratio(tokens['border'], tokens['surface'])).toBeGreaterThanOrEqual(4.5);
    });
  }
});
