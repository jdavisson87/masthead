import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  FieldError,
  Group,
  Input,
  Label,
  ListBox,
  Text,
  type ComboBoxProps as AriaComboBoxProps,
  type ValidationResult,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Popover } from '../Popover/Popover';
import { SelectItem, type SelectItemProps } from '../Select/Select';

/**
 * The field matches TextField and Select (same height, border-strong boundary, same focus language).
 * The border lives on the group around the input and the chevron button, so both read as one control.
 * Visual state comes from render props so every combination is resolved in one place.
 */
export const comboBoxStyles = tv({
  slots: {
    root: 'flex w-full flex-col gap-1.5 font-sans data-[disabled]:opacity-50',
    label: 'text-sm font-medium text-text',
    group:
      'masthead-control flex h-10 w-full items-center rounded-md border bg-surface text-sm text-text transition-colors',
    input:
      'h-full min-w-0 flex-1 bg-transparent pl-3 text-sm text-text outline-hidden placeholder:text-muted data-[disabled]:cursor-not-allowed',
    button:
      'flex h-full shrink-0 items-center px-2.5 text-muted outline-hidden data-[hovered]:text-text data-[disabled]:cursor-not-allowed',
    description: 'text-sm text-muted',
    error: 'text-sm text-danger',
    listbox: 'max-h-[inherit] overflow-auto p-1 outline-hidden',
    empty: 'px-2.5 py-1.5 text-sm text-muted',
  },
  variants: {
    invalid: {
      true: { group: 'border-danger' },
      false: { group: 'border-border-strong' },
    },
    hovered: { true: {}, false: {} },
    focused: {
      true: { group: 'outline-2 outline-accent' },
      false: {},
    },
    disabled: { true: {}, false: {} },
  },
  compoundVariants: [
    { invalid: false, disabled: false, hovered: true, focused: false, class: { group: 'border-text' } },
    { invalid: false, focused: true, class: { group: 'border-accent' } },
    { invalid: true, focused: true, class: { group: 'outline-danger' } },
  ],
  defaultVariants: { invalid: false, hovered: false, focused: false, disabled: false },
});

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
      className={`size-4 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
    >
      <path d="M3 6l5 5 5-5" />
    </svg>
  );
}

export interface ComboBoxProps<T extends object> extends Omit<AriaComboBoxProps<T>, 'className' | 'children'> {
  /** Visible label. Always required: every field needs an accessible name. */
  label: string;
  /** Helper text shown below the field and linked via aria-describedby. */
  description?: string;
  /** Shown when the field is invalid. May be a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  /** Shown in the list when nothing matches what was typed. */
  emptyMessage?: string;
  /** <ComboBoxItem> elements, or a function that renders one per item from `defaultItems` / `items`. */
  children: ReactNode | ((item: T) => ReactNode);
  className?: string;
}

/**
 * A text input that filters a list of options as you type. Pass `defaultItems` to let it filter for
 * you, or `items` to filter yourself (for example, results from a server).
 */
export function ComboBox<T extends object>({
  label,
  description,
  errorMessage,
  placeholder,
  emptyMessage = 'No results',
  children,
  className,
  ...props
}: ComboBoxProps<T>) {
  const styles = comboBoxStyles();

  return (
    <AriaComboBox {...props} allowsEmptyCollection className={styles.root({ className })}>
      {({ isOpen, isInvalid, isDisabled }) => (
        <>
          <Label className={styles.label()}>{label}</Label>
          <Group
            role="presentation"
            className={({ isHovered, isFocusWithin }) =>
              comboBoxStyles({
                invalid: isInvalid,
                hovered: isHovered,
                focused: isFocusWithin,
                disabled: isDisabled,
              }).group()
            }
          >
            <Input placeholder={placeholder} className={styles.input()} />
            <AriaButton className={styles.button()}>
              <Chevron open={isOpen} />
            </AriaButton>
          </Group>
          {description && (
            <Text slot="description" className={styles.description()}>
              {description}
            </Text>
          )}
          <FieldError className={styles.error()}>{errorMessage}</FieldError>
          <Popover offset={4} className="min-w-(--trigger-width)">
            <ListBox className={styles.listbox()} renderEmptyState={() => <div className={styles.empty()}>{emptyMessage}</div>}>
              {children}
            </ListBox>
          </Popover>
        </>
      )}
    </AriaComboBox>
  );
}

/** An option row. Same look as SelectItem: check mark plus weight on the selected option. */
export const ComboBoxItem = SelectItem;
export type ComboBoxItemProps = SelectItemProps;
