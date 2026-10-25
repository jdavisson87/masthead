# Masthead

Accessible React component library built with React Aria, Tailwind v4, and TypeScript.
A sharp, editorial look in light mode, with an amber accent in dark mode.

**[Live Storybook →](https://jdavisson87.github.io/masthead/)**

## Components

| Component | Built on | Notes |
|---|---|---|
| **Button** | React Aria `Button` | `primary`, `secondary`, `ghost`, `danger` intents; `sm`, `md`, `lg` sizes |
| **TextField** | React Aria `TextField` | Label, description, error message, real-time or native validation |
| **TextArea** | React Aria `TextField` + `TextArea` | Same field language as TextField; rows, optional resize, auto-grow, character counter with `maxLength` |
| **NumberField** | React Aria `NumberField` | Typed or stepped input, arrow / Page / Home / End keys, min / max / step, currency, percent and unit formats, locale-aware parsing |
| **Link** | React Aria `Link`, `RouterProvider` | Always underlined, inherits type size, safe `target="_blank"` handling with a screen-reader note, current-page state, works as an `<a>` or an action, client-side routing |
| **Separator** | React Aria `Separator` | Horizontal or vertical; subtle, strong or ink tone; thin or thick weight; `decorative` mode that hides it from assistive tech |
| **ProgressBar** | React Aria `ProgressBar` | Determinate and indeterminate, value shown as text, custom range and value label, sizes and tones, reduced-motion fallback |
| **Spinner** | React Aria `ProgressBar` (indeterminate) | Named `progressbar`, sizes and tones, optional visible label, `decorative` mode for use inside buttons, static under reduced motion |
| **Tag** | React Aria `TagGroup`, `TagList`, `Tag` | Selectable (single or multiple) and removable chips, arrow-key navigation, Delete / Backspace to remove, check mark on selected, empty state, sizes |
| **Ticker** | Plain elements + `IconButton` | News-style scrolling ticker for any feed (scores, quotes, headlines); pause button, pauses on hover and focus, static under reduced motion, hidden loop copies, up / down tones with arrows |
| **Stepper** | Plain elements + React Aria `Button` | Ordered list with `aria-current="step"`, state in text + icon (never color alone), horizontal / vertical / compact, circle or square markers, back-navigation to finished steps, `useStepFocus` hook for focus management |
| **Checkbox** | React Aria `Checkbox` | Checked, indeterminate, invalid, and disabled states |
| **Switch** | React Aria `Switch` | Squared track and thumb; respects `prefers-reduced-motion` |
| **Badge** | Plain `<span>` | `neutral`, `accent`, `success`, `danger` tones |
| **IconButton** | `Button` | Required `aria-label` (a type error without it); icon hidden from assistive tech |
| **Skeleton** | Plain `<div>` | `text` and `block` shapes; pulse is disabled for `prefers-reduced-motion` |
| **Popover** | React Aria `Popover`, `Dialog`, `DialogTrigger` | Standalone dialog popover and the base surface for Select and Menu; focus return and Escape handled |
| **RadioGroup** | React Aria `RadioGroup`, `Radio` | One tab stop with arrow-key selection, per-option descriptions, vertical or horizontal, label, description, error, form `name` |
| **Menu** | React Aria `MenuTrigger`, `Menu`, `MenuItem`, `MenuSection`, `SubmenuTrigger` | Arrow-key and typeahead navigation, icons, shortcut hints, descriptions, danger tone, sections, single or multiple selection, submenus |
| **Select** | React Aria `Select`, `ListBox`, `Popover` | Keyboard navigation, typeahead, label, description, error, static or dynamic items |
| **Dialog** | React Aria `Modal`, `Dialog` | Focus trap, scroll lock, Escape and outside-click dismiss; `alertdialog` mode for destructive confirmations |
| **Tooltip** | React Aria `TooltipTrigger`, `Tooltip` | Shows on hover and keyboard focus, hides on Escape, 500ms default delay, linked via `aria-describedby` |
| **Toast** | React Aria toast region and queue | `<Toaster />` plus `toast.success()` / `toast.error()` from anywhere; timers pause on hover and focus; F6 jumps to the region |
| **Table** | React Aria `Table` | Sortable columns, row headers, optional multi-select (reuses Checkbox), empty state, arrow-key cell navigation |
| **Tabs** | React Aria `Tabs`, `TabList`, `Tab`, `TabPanel` | Horizontal and vertical, arrow / Home / End keys, automatic or manual activation, disabled tabs |
| **ThemeToggle** / **ContrastToggle** | React Aria `ToggleButtonGroup`, `Switch` | Light / system / dark control plus an increased-contrast switch; persisted, follows OS settings live, syncs across tabs |
| **Card** | Plain elements | Composable: `Card`, `CardHeader`, `CardTitle` (choose heading level), `CardContent`, `CardFooter` |

Every interactive component has keyboard tests and automated axe checks, and control boundaries meet the WCAG 3:1 non-text contrast minimum in both themes.

More are planned: Combobox, Pagination, Avatar, and more.

## Theming

Dark mode is a `.dark` class on `<html>`. Masthead manages it for you:

```tsx
import { ThemeToggle, themeInitScript, useTheme } from '@jdavisson/masthead';

// 1. Prevent a flash of the wrong theme: inline this in <head>, before your CSS.
<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

// 2. Drop in the control...
<ThemeToggle />

// 3. ...or build your own with the hook.
const { theme, resolvedTheme, setTheme } = useTheme();
```

The choice (`light`, `dark`, or `system`) is stored in `localStorage` under `masthead-theme`. `system` follows the OS preference live.

### Increased contrast

`<ContrastToggle />` (or `setContrast(true)`) adds a `.contrast` class that works with both light and dark. Text and status colors reach 7:1 or better (WCAG AAA), control borders reach 11:1 or better, and controls get thicker borders (2px) and focus rings (3px). It turns on automatically when the OS reports `prefers-contrast: more`, until the user makes their own choice. A test reads the real tokens from `styles.css` and fails if any palette drops below its contrast threshold.

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
