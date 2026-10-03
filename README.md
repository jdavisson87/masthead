# Masthead

Accessible React component library built with React Aria, Tailwind v4, and TypeScript.
A sharp, editorial look in light mode, with a lime accent in dark mode.

**[Live Storybook →](https://jdavisson87.github.io/masthead/)**

## Stack

- React Aria Components for behavior and accessibility
- Tailwind CSS v4, with design tokens defined as CSS variables in `src/styles.css`
- `tailwind-variants` for component variants
- Vite library mode (ESM + CJS + types)
- Storybook for docs, Vitest + Testing Library + axe for tests

## Development

```bash
npm install
npm run dev          # Storybook on http://localhost:6006
npm test             # Vitest
npm run typecheck
npm run build        # library build into dist/
```

## Design decisions

- **Tokens are CSS variables.** Semantic tokens (`--color-accent`) point at theme variables (`--ds-accent`); toggling `.dark` on `<html>` re-themes everything with no runtime cost.
- **Borders, not shadows.** Small radii (2/4/6px), 1px borders, one accent used sparingly.
- **No Tailwind preflight in the shipped CSS.** A library shouldn't reset its consumers' base styles.
- **React Aria for behavior.** Masthead owns the API, tokens, theming, and docs; React Aria owns keyboard and screen-reader behavior.

## License

MIT
