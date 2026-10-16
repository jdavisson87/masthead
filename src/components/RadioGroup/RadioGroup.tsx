import { useId, type ReactNode } from 'react';
import {
  FieldError,
  Label,
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  Text,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
  type ValidationResult,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const radioGroupStyles = tv({
  slots: {
    group: 'flex flex-col gap-2 font-sans data-[disabled]:opacity-50',
    label: 'text-sm font-medium text-text',
    items: 'flex',
    description: 'text-sm text-muted',
    error: 'text-sm text-danger',
  },
  variants: {
    orientation: {
      vertical: { items: 'flex-col gap-3' },
      horizontal: { items: 'flex-row flex-wrap gap-x-6 gap-y-3' },
    },
  },
  defaultVariants: { orientation: 'vertical' },
});

/**
 * Visual state comes from React Aria's render props, resolved here in one place.
 * Unlike Checkbox (filled), a selected radio keeps its surface and shows an accent dot,
 * so the two controls stay distinguishable without relying on shape alone.
 * The circle boundary uses `border-strong` (3:1+, WCAG 1.4.11).
 */
export const radioStyles = tv({
  slots: {
    root: 'group flex items-start gap-2.5 font-sans text-sm text-text data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    circle:
      'masthead-control mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border bg-surface outline-hidden transition-colors motion-reduce:transition-none',
    dot: 'size-2.5 rounded-full bg-transparent transition-colors motion-reduce:transition-none',
    text: 'flex flex-col gap-0.5',
    description: 'text-sm text-muted',
  },
  variants: {
    selected: {
      true: { circle: 'border-accent', dot: 'bg-accent' },
      false: { circle: 'border-border-strong' },
    },
    hovered: { true: {}, false: {} },
    invalid: { true: {}, false: {} },
    focusVisible: {
      true: { circle: 'outline-2 outline-offset-2 outline-accent' },
      false: {},
    },
  },
  compoundVariants: [
    { selected: false, hovered: true, class: { circle: 'border-text bg-raised' } },
    { selected: true, hovered: true, class: { circle: 'border-accent-hover', dot: 'bg-accent-hover' } },
    { invalid: true, class: { circle: 'border-danger' } },
    { selected: true, invalid: true, class: { dot: 'bg-danger' } },
    { invalid: true, focusVisible: true, class: { circle: 'outline-danger' } },
  ],
  defaultVariants: { selected: false, hovered: false, invalid: false, focusVisible: false },
});

/* ---------------------------- RadioGroup ---------------------------- */

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'className' | 'children'> {
  /** Visible label for the group. Always required: a group needs an accessible name. */
  label: string;
  /** Helper text shown below the options and linked via aria-describedby. */
  description?: string;
  /** Shown when the group is invalid. May be a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** The `Radio` options. */
  children: ReactNode;
  className?: string;
}

export function RadioGroup({
  label,
  description,
  errorMessage,
  children,
  className,
  orientation = 'vertical',
  ...props
}: RadioGroupProps) {
  const styles = radioGroupStyles({ orientation });

  return (
    <AriaRadioGroup {...props} orientation={orientation} className={styles.group({ className })}>
      <Label className={styles.label()}>{label}</Label>
      <div className={styles.items()}>{children}</div>
      {description && (
        <Text slot="description" className={styles.description()}>
          {description}
        </Text>
      )}
      <FieldError className={styles.error()}>{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}

/* ------------------------------- Radio ------------------------------ */

export interface RadioProps extends Omit<AriaRadioProps, 'className' | 'children'> {
  /** Option label. */
  children: ReactNode;
  /** Secondary text under the label, announced as the option's description. */
  description?: string;
  className?: string;
}

export function Radio({ children, description, className, ...props }: RadioProps) {
  const labelId = useId();
  const descriptionId = useId();

  // The description lives inside the <label> so the whole row is clickable. Naming the input
  // from the label text alone keeps the description out of its accessible name.
  return (
    <AriaRadio
      {...props}
      aria-labelledby={description ? labelId : props['aria-labelledby']}
      aria-describedby={description ? descriptionId : props['aria-describedby']}
      className={radioStyles().root({ className })}
    >
      {({ isSelected, isHovered, isFocusVisible, isInvalid }) => {
        const s = radioStyles({
          selected: isSelected,
          hovered: isHovered,
          invalid: isInvalid,
          focusVisible: isFocusVisible,
        });
        return (
          <>
            <span className={s.circle()}>
              <span className={s.dot()} />
            </span>
            <span className={s.text()}>
              <span id={labelId}>{children}</span>
              {description && (
                <span id={descriptionId} className={s.description()}>
                  {description}
                </span>
              )}
            </span>
          </>
        );
      }}
    </AriaRadio>
  );
}
