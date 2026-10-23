import {
  Button,
  FieldError,
  Group,
  Input,
  Label,
  NumberField as AriaNumberField,
  Text,
  type NumberFieldProps as AriaNumberFieldProps,
  type ValidationResult,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * One bordered control that holds the input and the stepper buttons, so hover, focus and invalid
 * state apply to the whole thing (data-* attributes on the Group). The boundary uses `border-strong` (3:1+).
 * Steppers are mouse and touch affordances: keyboard users get ArrowUp / ArrowDown / PageUp / PageDown / Home / End
 * on the input, so the buttons stay out of the tab order (React Aria does this).
 */
export const numberFieldStyles = tv({
  slots: {
    root: 'flex w-full flex-col gap-1.5 font-sans data-[disabled]:opacity-50',
    label: 'text-sm font-medium text-text',
    group: [
      'masthead-control flex h-10 w-full overflow-hidden rounded-md border border-border-strong bg-surface text-text transition-colors',
      'data-[hovered]:border-text',
      'data-[focus-within]:border-accent data-[focus-within]:outline-2 data-[focus-within]:outline-accent',
      'data-[invalid]:border-danger data-[invalid]:data-[focus-within]:outline-danger',
      'data-[disabled]:cursor-not-allowed data-[disabled]:data-[hovered]:border-border-strong',
    ],
    input:
      'min-w-0 flex-1 bg-transparent px-3 text-center text-sm tabular-nums text-text outline-hidden placeholder:text-muted data-[disabled]:cursor-not-allowed',
    stepper: [
      'flex w-10 shrink-0 cursor-default items-center justify-center border-border-strong text-muted outline-hidden transition-colors',
      'data-[hovered]:bg-raised data-[hovered]:text-text data-[pressed]:bg-raised',
      'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-accent',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40 data-[disabled]:data-[hovered]:bg-transparent',
    ],
    description: 'text-sm text-muted',
    error: 'text-sm text-danger',
  },
  variants: {
    side: {
      start: { stepper: 'border-r' },
      end: { stepper: 'border-l' },
    },
  },
});

const icon = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', 'aria-hidden': true } as const;

const Minus = () => (
  <svg {...icon} className="size-4">
    <path d="M3.5 8h9" />
  </svg>
);

const Plus = () => (
  <svg {...icon} className="size-4">
    <path d="M3.5 8h9M8 3.5v9" />
  </svg>
);

export interface NumberFieldProps extends Omit<AriaNumberFieldProps, 'className' | 'children'> {
  /** Visible label. Always required: every field needs an accessible name. */
  label: string;
  /** Helper text shown below the field and linked via aria-describedby. */
  description?: string;
  /** Shown when the field is invalid. May be a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  /** Hide the − / + buttons and keep the keyboard behavior. */
  hideSteppers?: boolean;
  className?: string;
}

export function NumberField({
  label,
  description,
  errorMessage,
  placeholder,
  hideSteppers = false,
  className,
  ...props
}: NumberFieldProps) {
  const s = numberFieldStyles();

  return (
    <AriaNumberField {...props} className={s.root({ className })}>
      <Label className={s.label()}>{label}</Label>
      <Group className={s.group()}>
        {!hideSteppers && (
          <Button slot="decrement" className={numberFieldStyles({ side: 'start' }).stepper()}>
            <Minus />
          </Button>
        )}
        <Input placeholder={placeholder} className={s.input()} />
        {!hideSteppers && (
          <Button slot="increment" className={numberFieldStyles({ side: 'end' }).stepper()}>
            <Plus />
          </Button>
        )}
      </Group>
      {description && (
        <Text slot="description" className={s.description()}>
          {description}
        </Text>
      )}
      <FieldError className={s.error()}>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}
