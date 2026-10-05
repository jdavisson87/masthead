import type { ReactNode } from 'react';
import { Checkbox as AriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * Visual state comes from React Aria's render props (isSelected, isHovered, ...)
 * so every combination is resolved here, in one place, with no CSS-order surprises.
 * The box boundary uses `border-strong` (3:1+ contrast, WCAG 1.4.11).
 */
export const checkboxStyles = tv({
  slots: {
    root: 'group inline-flex items-center gap-2 font-sans text-sm text-text data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    box: 'flex size-5 shrink-0 items-center justify-center rounded-sm border text-accent-fg outline-hidden transition-colors',
  },
  variants: {
    checked: {
      true: { box: 'border-accent bg-accent' },
      false: { box: 'border-border-strong bg-surface' },
    },
    hovered: { true: {}, false: {} },
    invalid: { true: {}, false: {} },
    focusVisible: {
      true: { box: 'outline-2 outline-offset-2 outline-accent' },
      false: {},
    },
  },
  compoundVariants: [
    { checked: false, hovered: true, class: { box: 'border-text bg-raised' } },
    { checked: true, hovered: true, class: { box: 'border-accent-hover bg-accent-hover' } },
    { checked: false, invalid: true, class: { box: 'border-danger' } },
    { checked: true, invalid: true, class: { box: 'border-danger bg-danger' } },
    { invalid: true, focusVisible: true, class: { box: 'outline-danger' } },
  ],
  defaultVariants: { checked: false, hovered: false, invalid: false, focusVisible: false },
});

export interface CheckboxProps extends Omit<AriaCheckboxProps, 'className' | 'children'> {
  /** Label content. If omitted, provide `aria-label`. */
  children?: ReactNode;
  className?: string;
}

const Check = () => (
  <svg aria-hidden="true" viewBox="0 0 14 14" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2.5 7.5 5.5 10.5 11.5 3.5" />
  </svg>
);

const Dash = () => (
  <svg aria-hidden="true" viewBox="0 0 14 14" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 7h8" />
  </svg>
);

export function Checkbox({ children, className, ...props }: CheckboxProps) {
  const styles = checkboxStyles();

  return (
    <AriaCheckbox {...props} className={styles.root({ className })}>
      {({ isSelected, isIndeterminate, isHovered, isFocusVisible, isInvalid }) => (
        <>
          <span
            className={checkboxStyles({
              checked: isSelected || isIndeterminate,
              hovered: isHovered,
              invalid: isInvalid,
              focusVisible: isFocusVisible,
            }).box()}
          >
            {isIndeterminate ? <Dash /> : isSelected ? <Check /> : null}
          </span>
          {children}
        </>
      )}
    </AriaCheckbox>
  );
}
