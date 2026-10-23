import { useState } from 'react';
import {
  FieldError,
  Label,
  Text,
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { textFieldStyles } from '../TextField/TextField';

/**
 * Same field language as TextField (label, border-strong boundary, focus, invalid), extended for multi-line text.
 */
export const textAreaStyles = tv({
  extend: textFieldStyles,
  slots: {
    input: 'h-auto min-h-24 py-2 leading-relaxed',
    footer: 'flex items-start justify-between gap-3',
    counter: 'ml-auto shrink-0 font-mono text-xs tabular-nums text-muted',
  },
  variants: {
    resize: {
      none: { input: 'resize-none' },
      vertical: { input: 'resize-y' },
    },
    // field-sizing is supported in current Chromium and Safari; elsewhere the box keeps its `rows` height and scrolls.
    autoGrow: {
      true: { input: 'field-sizing-content max-h-80' },
      false: {},
    },
    atLimit: {
      true: { counter: 'text-danger' },
      false: {},
    },
  },
  defaultVariants: { resize: 'vertical', autoGrow: false, atLimit: false },
});

export interface TextAreaProps extends Omit<AriaTextFieldProps, 'className' | 'children'> {
  /** Visible label. Always required: every field needs an accessible name. */
  label: string;
  /** Helper text shown below the field and linked via aria-describedby. */
  description?: string;
  /** Shown when the field is invalid. May be a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  /** Visible lines of text. */
  rows?: number;
  /** Let the user drag the bottom edge to resize. Ignored when `autoGrow` is on. */
  resize?: 'none' | 'vertical';
  /** Grow with the content, up to a maximum height, then scroll. */
  autoGrow?: boolean;
  className?: string;
}

export function TextArea({
  label,
  description,
  errorMessage,
  placeholder,
  rows = 3,
  resize = 'vertical',
  autoGrow = false,
  className,
  maxLength,
  value,
  defaultValue,
  onChange,
  ...props
}: TextAreaProps) {
  // Track length for the counter when the field is uncontrolled.
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
  const length = (value ?? uncontrolled).length;
  const s = textAreaStyles({ resize: autoGrow ? 'none' : resize, autoGrow, atLimit: maxLength != null && length >= maxLength });
  const showFooter = Boolean(description) || maxLength != null;

  return (
    <AriaTextField
      {...props}
      maxLength={maxLength}
      value={value}
      defaultValue={defaultValue}
      onChange={(next) => {
        setUncontrolled(next);
        onChange?.(next);
      }}
      className={s.root({ className })}
    >
      <Label className={s.label()}>{label}</Label>
      <AriaTextArea rows={rows} placeholder={placeholder} className={s.input()} />
      {showFooter && (
        <div className={s.footer()}>
          {description && (
            <Text slot="description" className={s.description()}>
              {description}
            </Text>
          )}
          {/* The browser enforces maxLength, so the counter is a visual aid and stays out of the accessibility tree. */}
          {maxLength != null && (
            <span aria-hidden="true" className={s.counter()}>
              {length} / {maxLength}
            </span>
          )}
        </div>
      )}
      <FieldError className={s.error()}>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
