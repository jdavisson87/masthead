import { createContext, useContext, type ReactNode } from 'react';
import {
  Button,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  type DisclosureGroupProps,
  type DisclosureProps,
} from 'react-aria-components';
import { tv } from '../../theme/tv';

/**
 * Collapsible sections. Each title is a real heading wrapping a button with `aria-expanded` and
 * `aria-controls`, so headings navigation still works and the state is spoken, not just drawn.
 * The chevron points down or up, so open and closed differ in shape, not color.
 *
 * Closed panels use `hidden="until-found"`: the browser's find-in-page still searches them and opens
 * the section on a match. That is why the panel slot never sets `display`.
 */
export const accordionStyles = tv({
  slots: {
    group: 'flex flex-col font-sans text-text',
    item: 'border-b border-border data-[disabled]:opacity-50',
    heading: 'm-0 font-normal',
    trigger: [
      'flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-0 py-4 text-left',
      'font-serif text-heading-xs font-medium text-text outline-hidden',
      'decoration-border-strong underline-offset-4 data-[hovered]:underline',
      'data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-accent',
      'data-[disabled]:cursor-not-allowed data-[disabled]:no-underline',
    ],
    chevron: 'size-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none',
    // React Aria sets --disclosure-panel-height in pixels while opening and closing, then back to auto.
    panel: 'h-(--disclosure-panel-height) overflow-clip transition-[height] duration-200 ease-out motion-reduce:transition-none',
    content: 'pb-5 text-body-md text-text [&>p]:m-0 [&>p+p]:mt-3',
  },
  variants: {
    variant: {
      /** Rules between sections, edge to edge. Suits long-form pages. */
      divided: { group: 'border-t border-border' },
      /** One bordered box with padded sections. Suits cards and sidebars. */
      boxed: {
        group: 'rounded-lg border border-border-strong',
        item: 'last:border-b-0',
        trigger: 'px-4',
        content: 'px-4',
      },
    },
  },
  defaultVariants: { variant: 'divided' },
});

type HeadingLevel = 2 | 3 | 4 | 5 | 6;

const AccordionContext = createContext<{ headingLevel: HeadingLevel; variant: 'divided' | 'boxed' }>({
  headingLevel: 3,
  variant: 'divided',
});

export interface AccordionProps extends Omit<DisclosureGroupProps, 'className' | 'children'> {
  /** <AccordionItem> elements. */
  children: ReactNode;
  /**
   * Heading level for every item's title. Pick the level that fits the page outline (an accordion under
   * an h2 uses 3). Defaults to 3.
   */
  headingLevel?: HeadingLevel;
  variant?: 'divided' | 'boxed';
  className?: string;
}

/**
 * A group of AccordionItems. One section opens at a time unless `allowsMultipleExpanded` is set.
 * Control it with `expandedKeys` / `onExpandedChange`, keyed by each item's `id`.
 */
export function Accordion({ children, headingLevel = 3, variant = 'divided', className, ...props }: AccordionProps) {
  return (
    <AccordionContext.Provider value={{ headingLevel, variant }}>
      <DisclosureGroup {...props} className={accordionStyles({ variant }).group({ className })}>
        {children}
      </DisclosureGroup>
    </AccordionContext.Provider>
  );
}

function Chevron({ expanded, className }: { expanded: boolean; className: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
      className={`${className} ${expanded ? 'rotate-180' : ''}`}
    >
      <path d="M3 6l5 5 5-5" />
    </svg>
  );
}

export interface AccordionItemProps extends Omit<DisclosureProps, 'className' | 'children'> {
  /** The section title, shown in the heading and used as the panel's accessible name. */
  title: ReactNode;
  /** The section content. */
  children: ReactNode;
  /** Override the heading level set on the Accordion. */
  headingLevel?: HeadingLevel;
  className?: string;
}

/**
 * One collapsible section. Inside an Accordion it takes part in the group's expanded state (give it an
 * `id`); on its own it is a standalone disclosure with `isExpanded` / `defaultExpanded`.
 */
export function AccordionItem({ title, children, headingLevel, className, ...props }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  const s = accordionStyles({ variant: context.variant });
  return (
    <Disclosure {...props} className={s.item({ className })}>
      {({ isExpanded }) => (
        <>
          <Heading level={headingLevel ?? context.headingLevel} className={s.heading()}>
            <Button slot="trigger" className={s.trigger()}>
              <span>{title}</span>
              <Chevron expanded={isExpanded} className={s.chevron()} />
            </Button>
          </Heading>
          <DisclosurePanel className={s.panel()}>
            <div className={s.content()}>{children}</div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
