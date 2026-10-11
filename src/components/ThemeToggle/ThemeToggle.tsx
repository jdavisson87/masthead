import type { ReactNode } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { isTheme, setTheme, THEMES, type Theme } from '../../theme/theme';
import { useTheme } from '../../theme/useTheme';

/**
 * Segmented light / system / dark control. A single-select ToggleButtonGroup,
 * so it is a radiogroup with arrow-key navigation and proper aria-checked state.
 * Selection is driven by render props, never by CSS ordering.
 */
export const themeToggleStyles = tv({
  slots: {
    group: 'inline-flex items-center gap-0.5 rounded-md border border-border-strong bg-surface p-0.5 font-sans',
    item: [
      'inline-flex cursor-default select-none items-center justify-center gap-1.5 rounded-sm font-medium outline-hidden transition-colors',
      'data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-accent',
    ],
  },
  variants: {
    size: {
      sm: { item: 'h-7 min-w-7 px-1.5 text-xs' },
      md: { item: 'h-8 min-w-8 px-2 text-sm' },
    },
    selected: {
      true: { item: 'bg-accent text-accent-fg' },
      false: { item: 'text-muted' },
    },
    hovered: { true: {}, false: {} },
  },
  compoundVariants: [{ selected: false, hovered: true, class: { item: 'bg-raised text-text' } }],
  defaultVariants: { size: 'md', selected: false, hovered: false },
});

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const;

const OPTIONS: Record<Theme, { label: string; icon: ReactNode }> = {
  light: {
    label: 'Light',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  system: {
    label: 'System',
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  dark: {
    label: 'Dark',
    icon: (
      <svg {...iconProps}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
};

export interface ThemeToggleProps {
  size?: 'sm' | 'md';
  /** Show text next to each icon. Icons-only by default; each button always has an accessible name. */
  showLabels?: boolean;
  /** Accessible name of the group. */
  'aria-label'?: string;
  className?: string;
}

export function ThemeToggle({ size = 'md', showLabels = false, 'aria-label': ariaLabel = 'Color theme', className }: ThemeToggleProps) {
  const { theme } = useTheme();
  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[theme]}
      onSelectionChange={(keys) => {
        const next = [...keys][0];
        if (isTheme(next)) setTheme(next);
      }}
      className={themeToggleStyles({ size }).group({ className })}
    >
      {THEMES.map((value) => {
        const { label, icon } = OPTIONS[value];
        return (
          <ToggleButton
            key={value}
            id={value}
            aria-label={label}
            className={({ isSelected, isHovered }) =>
              themeToggleStyles({ size, selected: isSelected, hovered: isHovered }).item()
            }
          >
            {icon}
            {showLabels ? <span>{label}</span> : null}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
}
