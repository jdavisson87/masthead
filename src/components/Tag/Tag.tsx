import { createContext, useContext, type ReactNode } from 'react';
import {
  Button,
  Label,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList,
  Text,
  type TagGroupProps as AriaTagGroupProps,
  type TagProps as AriaTagProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * Tags are interactive: they can be selected (filters), removed (applied values), or both.
 * For static status labels use Badge instead. State comes from render props, resolved in one place.
 * Selection is shown by a filled chip plus a check mark, never by color alone.
 */
export const tagStyles = tv({
  slots: {
    group: 'flex flex-col gap-1.5 font-sans',
    label: 'text-sm font-medium text-text',
    list: 'flex flex-wrap gap-2',
    description: 'text-sm text-muted',
    empty: 'text-sm text-muted',
    tag: [
      'masthead-control inline-flex cursor-default select-none items-center gap-1.5 rounded-sm border font-sans outline-hidden transition-colors motion-reduce:transition-none',
    ],
    remove: [
      'flex size-4 shrink-0 cursor-default items-center justify-center rounded-sm outline-hidden transition-colors',
      'data-[hovered]:bg-current/15 data-[pressed]:bg-current/25',
      'data-[focus-visible]:outline-2 data-[focus-visible]:outline-current',
    ],
  },
  variants: {
    size: {
      sm: { tag: 'h-6 px-2 text-xs' },
      md: { tag: 'h-7 px-2.5 text-sm' },
    },
    selected: {
      true: { tag: 'border-accent bg-accent text-accent-fg' },
      false: { tag: 'border-border-strong bg-surface text-text' },
    },
    hovered: { true: {}, false: {} },
    focusVisible: {
      true: { tag: 'outline-2 outline-offset-2 outline-accent' },
      false: {},
    },
    disabled: {
      true: { tag: 'cursor-not-allowed opacity-50' },
      false: {},
    },
    hideLabel: {
      true: { label: 'sr-only' },
      false: {},
    },
  },
  compoundVariants: [
    { selected: false, hovered: true, disabled: false, class: { tag: 'border-text bg-raised' } },
    { selected: true, hovered: true, disabled: false, class: { tag: 'border-accent-hover bg-accent-hover' } },
  ],
  defaultVariants: { size: 'md', selected: false, hovered: false, focusVisible: false, disabled: false, hideLabel: false },
});

type Size = 'sm' | 'md';
const SizeContext = createContext<Size>('md');

const icon = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', 'aria-hidden': true } as const;

const Check = () => (
  <svg {...icon} className="size-3.5 shrink-0">
    <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinejoin="round" />
  </svg>
);

const Cross = () => (
  <svg {...icon} className="size-3">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

/* ----------------------------- TagGroup ----------------------------- */

export interface TagGroupProps<T> extends Omit<AriaTagGroupProps, 'className' | 'children'> {
  /** Names the group. Always required; use `hideLabel` to keep it screen-reader-only. */
  label: string;
  hideLabel?: boolean;
  /** Helper text linked to the group via aria-describedby. */
  description?: string;
  /** Shown when there are no tags. Only applies to groups rendered from `items`. */
  emptyMessage?: string;
  size?: Size;
  /** Pass for dynamic collections; render each with the function form of `children`. */
  items?: Iterable<T>;
  /** <Tag> elements, or a function that renders one per item. */
  children: ReactNode | ((item: T) => ReactNode);
  className?: string;
}

export function TagGroup<T extends object>({
  label,
  hideLabel = false,
  description,
  emptyMessage,
  size = 'md',
  items,
  children,
  className,
  ...props
}: TagGroupProps<T>) {
  const s = tagStyles({ hideLabel });
  return (
    <SizeContext.Provider value={size}>
      <AriaTagGroup {...props} className={s.group({ className })}>
        <Label className={s.label()}>{label}</Label>
        <TagList
          items={items}
          className={s.list()}
          renderEmptyState={emptyMessage ? () => <span className={s.empty()}>{emptyMessage}</span> : undefined}
        >
          {children}
        </TagList>
        {description && (
          <Text slot="description" className={s.description()}>
            {description}
          </Text>
        )}
      </AriaTagGroup>
    </SizeContext.Provider>
  );
}

/* -------------------------------- Tag -------------------------------- */

export interface TagProps extends Omit<AriaTagProps, 'className' | 'children'> {
  children: ReactNode;
  className?: string;
}

export function Tag({ children, className, textValue, ...props }: TagProps) {
  const size = useContext(SizeContext);
  return (
    <AriaTag
      {...props}
      textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
      className={({ isSelected, isHovered, isFocusVisible, isDisabled }) =>
        tagStyles({ size, selected: isSelected, hovered: isHovered, focusVisible: isFocusVisible, disabled: isDisabled }).tag({ className })
      }
    >
      {({ allowsRemoving, isSelected }) => {
        const s = tagStyles();
        return (
          <>
            {isSelected && <Check />}
            {children}
            {allowsRemoving && (
              <Button slot="remove" className={s.remove()}>
                <Cross />
              </Button>
            )}
          </>
        );
      }}
    </AriaTag>
  );
}
