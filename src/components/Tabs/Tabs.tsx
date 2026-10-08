import { createContext, useContext, type ReactNode } from 'react';
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  type TabListProps as AriaTabListProps,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * Editorial tabs: a 1px rule with a 2px accent underline on the selected tab.
 * React Aria provides roving focus, arrow-key / Home / End navigation, and the tab/tabpanel wiring.
 * Orientation is shared through context so the list, tabs, and panels stay in step.
 */
export const tabsStyles = tv({
  slots: {
    root: 'font-sans text-text',
    list: 'flex border-border',
    tab: [
      'text-sm font-medium outline-hidden transition-colors cursor-default select-none border-transparent',
      'data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-accent',
    ],
    panel: 'rounded-sm text-sm outline-hidden data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-accent',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'flex flex-col',
        list: 'gap-6 border-b',
        tab: '-mb-px border-b-2 pb-2.5 pt-2',
        panel: 'mt-4',
      },
      vertical: {
        root: 'flex flex-row',
        list: 'flex-col border-r',
        tab: '-mr-px border-r-2 py-2 pl-1 pr-5 text-left',
        panel: 'ml-6',
      },
    },
    selected: {
      true: { tab: 'border-accent text-text' },
      false: { tab: 'text-muted' },
    },
    hovered: { true: {}, false: {} },
    disabled: { true: { tab: 'cursor-not-allowed opacity-50' }, false: {} },
  },
  compoundVariants: [{ selected: false, hovered: true, disabled: false, class: { tab: 'text-text' } }],
  defaultVariants: { orientation: 'horizontal', selected: false, hovered: false, disabled: false },
});

type Orientation = 'horizontal' | 'vertical';
const OrientationContext = createContext<Orientation>('horizontal');

/* ------------------------------ Tabs ------------------------------ */

export interface TabsProps extends Omit<AriaTabsProps, 'className'> {
  className?: string;
}

export function Tabs({ className, orientation = 'horizontal', ...props }: TabsProps) {
  const styles = tabsStyles({ orientation });
  return (
    <OrientationContext.Provider value={orientation}>
      <AriaTabs {...props} orientation={orientation} className={styles.root({ className })} />
    </OrientationContext.Provider>
  );
}

/* ----------------------------- TabList ----------------------------- */

export interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'className'> {
  /** Required: a tab list needs an accessible name. */
  'aria-label': string;
  className?: string;
}

export function TabList<T extends object>({ className, ...props }: TabListProps<T>) {
  const orientation = useContext(OrientationContext);
  return <AriaTabList {...props} className={tabsStyles({ orientation }).list({ className })} />;
}

/* ------------------------------- Tab ------------------------------- */

export interface TabProps extends Omit<AriaTabProps, 'className' | 'children'> {
  children: ReactNode;
  className?: string;
}

export function Tab({ children, className, ...props }: TabProps) {
  const orientation = useContext(OrientationContext);
  return (
    <AriaTab
      {...props}
      className={({ isSelected, isHovered, isDisabled }) =>
        tabsStyles({ orientation, selected: isSelected, hovered: isHovered, disabled: isDisabled }).tab({ className })
      }
    >
      {children}
    </AriaTab>
  );
}

/* ----------------------------- TabPanel ---------------------------- */

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'className'> {
  className?: string;
}

export function TabPanel({ className, ...props }: TabPanelProps) {
  const orientation = useContext(OrientationContext);
  return <AriaTabPanel {...props} className={tabsStyles({ orientation }).panel({ className })} />;
}
