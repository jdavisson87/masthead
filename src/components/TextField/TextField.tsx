import {
  FieldError,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * Control boundaries use `border-strong` (3:1+ contrast, WCAG 1.4.11).
 * React Aria exposes state as data attributes: data-hovered, data-focused,
 * data-focus-visible, data-invalid, data-disabled.
 */
export const textFieldStyles = tv({
  slots: {
    root: 'flex w-full flex-col gap-1.5 font-sans data-[disabled]:opacity-50',
    label: 'text-sm font-medium text-text',
    input: [
      'h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-text',
      'placeholder:text-muted outline-hidden transition-colors',
      'data-[hovered]:border-text',
      'data-[focused]:border-accent data-[focused]:outline-2 data-[focused]:outline-accent',
      'data-[invalid]:border-danger data-[invalid]:data-[focused]:outline-danger',
      'data-[disabled]:cursor-not-allowed data-[disabled]:data-[hovered]:border-border-strong',
    ],
    description: 'text-sm text-muted',
    error: 'text-sm text-danger',
  },
});

export interface TextFieldProps extends Omit<AriaTextFieldProps, 'className' | 'children'> {
  /** Visible label. Always required: every field needs an accessible name. */
  label: string;
  /** Helper text shown below the input and linked via aria-describedby. */
  description?: string;
  /** Shown when the field is invalid. May be a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  className?: string;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  className,
  ...props
}: TextFieldProps) {
  const styles = textFieldStyles();

  return (
    <AriaTextField {...props} className={styles.root({ className })}>
      <Label className={styles.label()}>{label}</Label>
      <Input placeholder={placeholder} className={styles.input()} />
      {description && (
        <Text slot="description" className={styles.description()}>
          {description}
        </Text>
      )}
      <FieldError className={styles.error()}>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
