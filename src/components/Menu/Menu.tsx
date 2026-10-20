import type { ReactNode } from 'react';
import {
  Header,
  Keyboard,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger,
  Separator,
  SubmenuTrigger,
  Text,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  type MenuSectionProps as AriaMenuSectionProps,
  type PopoverProps as AriaPopoverProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Popover } from '../Popover/Popover';

/**
 * Menus reuse the Popover surface so every floating layer looks the same.
 * React Aria provides focus management, arrow-key and typeahead navigation, Escape to close,
 * focus return, and the menu / menuitem / menuitemradio / menuitemcheckbox roles.
 * Danger tone is meant to be paired with an `icon` so meaning is never carried by color alone.
 */
export const menuStyles = tv({
  slots: {
    popover: 'min-w-48',
    list: 'max-h-[inherit] overflow-auto p-1 font-sans text-sm outline-hidden',
    item: [
      'flex cursor-default select-none items-center gap-2.5 rounded-sm px-2.5 py-1.5 outline-hidden',
      'data-[focused]:bg-overlay-hover data-[pressed]:bg-overlay-hover',
      'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-accent',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    indicator: 'flex size-4 shrink-0 items-center justify-center text-accent',
    icon: 'flex size-4 shrink-0 items-center justify-center [&>svg]:size-4',
    text: 'flex min-w-0 flex-1 flex-col',
    label: 'truncate',
    description: 'truncate text-xs text-muted',
    shortcut: 'ml-4 shrink-0 font-mono text-xs text-muted',
    chevron: 'size-4 shrink-0 text-muted',
    section: 'flex flex-col',
    header: 'px-2.5 pb-1 pt-2 font-mono text-xs uppercase tracking-wider text-muted',
    separator: 'mx-1 my-1 h-px bg-border',
  },
  variants: {
    tone: {
      default: { item: 'text-text' },
      danger: { item: 'text-danger' },
    },
  },
  defaultVariants: { tone: 'default' },
});

const iconProps = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, 'aria-hidden': true } as const;

function Check() {
  return (
    <svg {...iconProps} className="size-4">
      <path d="M3 8.5l3.5 3.5L13 4.5" />
    </svg>
  );
}

function ChevronRight({ className }: { className: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

/* ------------------------------ Menu ------------------------------ */

/**
 * Wraps a trigger button and a <Menu>. React Aria wires aria-haspopup / aria-expanded on the trigger,
 * and names the menu from it.
 */
export { MenuTrigger };

/** Wraps a <MenuItem> and a nested <Menu> to make a submenu. Opens with ArrowRight, hover, or Enter. */
export { SubmenuTrigger };

export interface MenuProps<T> extends Omit<AriaMenuProps<T>, 'className'> {
  /** Where the menu opens relative to its trigger. */
  placement?: AriaPopoverProps['placement'];
  className?: string;
}

export function Menu<T extends object>({ placement, className, ...props }: MenuProps<T>) {
  const styles = menuStyles();
  return (
    <Popover placement={placement} offset={4} className={styles.popover()}>
      <AriaMenu {...props} className={styles.list({ className })} />
    </Popover>
  );
}

/* ---------------------------- MenuItem ---------------------------- */

export interface MenuItemProps extends Omit<AriaMenuItemProps, 'className' | 'children'> {
  children: ReactNode;
  /** Secondary text under the label, announced as the item's description. */
  description?: string;
  /** Leading icon, hidden from assistive tech. Pair it with `tone="danger"`. */
  icon?: ReactNode;
  /**
   * Visual hint for a keyboard shortcut ("⌘K"). It only displays the hint;
   * wiring the shortcut itself is up to the app.
   */
  shortcut?: string;
  /** Use `danger` for destructive actions such as Delete. */
  tone?: 'default' | 'danger';
  className?: string;
}

export function MenuItem({
  children,
  description,
  icon,
  shortcut,
  tone = 'default',
  className,
  textValue,
  ...props
}: MenuItemProps) {
  const s = menuStyles({ tone });
  return (
    <AriaMenuItem
      {...props}
      textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
      className={s.item({ className })}
    >
      {({ selectionMode, isSelected, hasSubmenu }) => (
        <>
          {selectionMode !== 'none' && <span className={s.indicator()}>{isSelected && <Check />}</span>}
          {icon && (
            <span aria-hidden="true" className={s.icon()}>
              {icon}
            </span>
          )}
          <span className={s.text()}>
            <Text slot="label" className={s.label()}>
              {children}
            </Text>
            {description && (
              <Text slot="description" className={s.description()}>
                {description}
              </Text>
            )}
          </span>
          {shortcut && <Keyboard className={s.shortcut()}>{shortcut}</Keyboard>}
          {hasSubmenu && <ChevronRight className={s.chevron()} />}
        </>
      )}
    </AriaMenuItem>
  );
}

/* --------------------- MenuSection / MenuSeparator --------------------- */

export interface MenuSectionProps extends Omit<AriaMenuSectionProps<object>, 'className' | 'children' | 'items'> {
  /** Heading for the group; it also names the group for assistive tech. */
  title?: string;
  /** Static `MenuItem`s. For a dynamic list, render React Aria's `Collection` here. */
  children: ReactNode;
  className?: string;
}

export function MenuSection({ title, children, className, ...props }: MenuSectionProps) {
  const s = menuStyles();
  return (
    <AriaMenuSection {...props} className={s.section({ className })}>
      {title && <Header className={s.header()}>{title}</Header>}
      {children}
    </AriaMenuSection>
  );
}

export function MenuSeparator({ className }: { className?: string }) {
  return <Separator className={menuStyles().separator({ className })} />;
}
