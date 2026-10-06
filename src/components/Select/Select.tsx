import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Select as AriaSelect,
  SelectValue,
  Text,
  type ListBoxItemProps,
  type SelectProps as AriaSelectProps,
  type ValidationResult,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Popover } from '../Popover/Popover';

/**
 * The trigger matches TextField (same height, border-strong boundary, same focus language).
 * Visual state comes from render props so every combination is resolved in one place.
 */
export const selectStyles = tv({
  slots: {
    root: 'flex w-full flex-col gap-1.5 font-sans data-[disabled]:opacity-50',
    label: 'text-sm font-medium text-text',
    trigger:
      'flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-surface px-3 text-left text-sm text-text outline-hidden transition-colors data-[disabled]:cursor-not-allowed',
    value: 'truncate data-[placeholder]:text-muted',
    description: 'text-sm text-muted',
    error: 'text-sm text-danger',
    listbox: 'max-h-[inherit] overflow-auto p-1 outline-hidden',
    item: [
      'flex cursor-default items-center justify-between gap-3 rounded-sm px-2.5 py-1.5 text-sm text-text outline-hidden',
      'data-[focused]:bg-raised data-[selected]:font-medium',
      'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-accent',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
  },
  variants: {
    invalid: {
      true: { trigger: 'border-danger' },
      false: { trigger: 'border-border-strong' },
    },
    hovered: { true: {}, false: {} },
    open: { true: {}, false: {} },
    focusVisible: {
      true: { trigger: 'outline-2 outline-accent' },
      false: {},
    },
  },
  compoundVariants: [
    { invalid: false, hovered: true, class: { trigger: 'border-text' } },
    { invalid: false, open: true, class: { trigger: 'border-accent' } },
    { invalid: true, focusVisible: true, class: { trigger: 'outline-danger' } },
  ],
  defaultVariants: { invalid: false, hovered: false, open: false, focusVisible: false },
});

const icon = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, 'aria-hidden': true } as const;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg {...icon} className={`size-4 shrink-0 text-muted transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}>
      <path d="M3 6l5 5 5-5" />
    </svg>
  );
}

function Check() {
  return (
    <svg {...icon} className="size-4 shrink-0 text-accent">
      <path d="M3 8.5l3.5 3.5L13 4.5" />
    </svg>
  );
}

export interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, 'className' | 'children'> {
  /** Visible label. Always required: every field needs an accessible name. */
  label: string;
  /** Helper text shown below the trigger and linked via aria-describedby. */
  description?: string;
  /** Shown when the field is invalid. May be a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Pass for dynamic collections; render each with the function form of `children`. */
  items?: Iterable<T>;
  /** <SelectItem> elements, or a function that renders one per item. */
  children: ReactNode | ((item: T) => ReactNode);
  className?: string;
}

export function Select<T extends object>({
  label,
  description,
  errorMessage,
  items,
  children,
  className,
  ...props
}: SelectProps<T>) {
  const styles = selectStyles();

  return (
    <AriaSelect {...props} className={styles.root({ className })}>
      {({ isOpen, isInvalid }) => (
        <>
          <Label className={styles.label()}>{label}</Label>
          <AriaButton
            className={({ isHovered, isFocusVisible }) =>
              selectStyles({ invalid: isInvalid, hovered: isHovered, open: isOpen, focusVisible: isFocusVisible }).trigger()
            }
          >
            <SelectValue className={styles.value()} />
            <Chevron open={isOpen} />
          </AriaButton>
          {description && (
            <Text slot="description" className={styles.description()}>
              {description}
            </Text>
          )}
          <FieldError className={styles.error()}>{errorMessage}</FieldError>
          <Popover offset={4} className="min-w-(--trigger-width)">
            <ListBox items={items} className={styles.listbox()}>
              {children}
            </ListBox>
          </Popover>
        </>
      )}
    </AriaSelect>
  );
}

export interface SelectItemProps extends Omit<ListBoxItemProps, 'className' | 'children'> {
  children: ReactNode;
  className?: string;
}

export function SelectItem({ children, className, textValue, ...props }: SelectItemProps) {
  const styles = selectStyles();
  return (
    <ListBoxItem
      {...props}
      textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
      className={styles.item({ className })}
    >
      {({ isSelected }) => (
        <>
          <span className="truncate">{children}</span>
          {isSelected && <Check />}
        </>
      )}
    </ListBoxItem>
  );
}
