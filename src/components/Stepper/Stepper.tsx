import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * Progress through a multi-step flow. It is a real ordered list inside a labelled <nav>:
 * the current step has aria-current="step", and every step's state is also written as hidden text
 * ("completed", "current step", "has errors"), so state is never carried by color alone.
 * The marker (a circle, or a square with `shape="square"`) shows a check, a number, or "!" in addition to its color;
 * finished connectors are thicker.
 * `variant="compact"` shows "Step 2 of 4" for narrow screens and keeps the full list for assistive tech.
 */
export const stepperStyles = tv({
  slots: {
    root: 'font-sans text-text',
    list: 'm-0 flex list-none p-0',
    item: 'relative',
    step: 'flex min-w-0 items-start gap-2.5 text-left outline-hidden',
    marker: 'flex size-7 shrink-0 items-center justify-center border bg-surface font-mono text-xs font-medium',
    text: 'flex min-w-0 flex-col pt-[3px]',
    label: 'text-sm',
    description: 'text-xs text-muted',
    optional: 'ml-1.5 font-mono text-xs uppercase tracking-wider text-muted',
    connector: 'shrink-0',
    compact: 'flex flex-col gap-2',
    compactEyebrow: 'font-mono text-xs uppercase tracking-wider text-muted',
    compactTitle: 'font-serif text-lg font-medium',
    bars: 'flex gap-1',
    bar: 'h-1 flex-1',
  },
  variants: {
    orientation: {
      horizontal: {
        list: 'flex-row items-start gap-3',
        item: 'flex flex-1 items-start gap-3 last:flex-none',
        connector: 'flex-1',
      },
      vertical: {
        list: 'flex-col',
        item: 'flex gap-3 pb-7 last:pb-0',
        connector: 'absolute left-[13px] top-8 bottom-1',
      },
    },
    status: {
      complete: { marker: 'border-accent bg-accent text-accent-fg', label: 'font-medium text-text' },
      current: { marker: 'border-2 border-accent text-accent', label: 'font-semibold text-text' },
      upcoming: { marker: 'border-border-strong text-muted', label: 'text-muted' },
      error: { marker: 'border-2 border-danger text-danger', label: 'font-medium text-danger' },
    },
    done: {
      true: { connector: 'bg-accent' },
      false: { connector: 'bg-border-strong' },
    },
    pressable: {
      true: {
        step: 'cursor-pointer rounded-sm data-[hovered]:underline data-[hovered]:underline-offset-4 data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-4 data-[focus-visible]:outline-accent',
      },
      false: { step: 'cursor-default' },
    },
    shape: {
      circle: { marker: 'rounded-full' },
      square: { marker: 'rounded-sm' },
    },
    reached: {
      true: { bar: 'bg-accent' },
      false: { bar: 'bg-border-strong' },
    },
  },
  compoundVariants: [
    { orientation: 'horizontal', done: true, class: { connector: 'mt-3 h-0.5' } },
    { orientation: 'horizontal', done: false, class: { connector: 'mt-[13px] h-px' } },
    { orientation: 'vertical', done: true, class: { connector: 'w-0.5' } },
    { orientation: 'vertical', done: false, class: { connector: 'w-px' } },
  ],
  defaultVariants: { orientation: 'horizontal', status: 'upcoming', done: false, pressable: false, shape: 'circle', reached: false },
});

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error';

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  /** Shows "Optional" next to the label. */
  optional?: boolean;
  /** Marks the step as having errors (a failed validation). Announced and shown with "!". */
  error?: boolean;
}

export interface StepperProps {
  steps: StepperStep[];
  /**
   * Zero-based index of the current step. Use `steps.length` to show every step as complete
   * (a finished flow); then no step is "current".
   */
  currentStep: number;
  /** Names the navigation landmark. */
  'aria-label'?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'full' | 'compact';
  /** Shape of the step markers. */
  shape?: 'circle' | 'square';
  /**
   * When set, completed steps become buttons that call this with the step's index, so people can go back.
   * Not available in the compact variant, which has no visible list to press.
   */
  onStepPress?: (index: number) => void;
  className?: string;
}

const icon = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

const Check = () => (
  <svg {...icon} className="size-3.5">
    <path d="M3 8.5l3.5 3.5L13 4.5" />
  </svg>
);

const Alert = () => (
  <svg {...icon} className="size-3.5">
    <path d="M8 3v6M8 12.5v.01" />
  </svg>
);

function statusOf(index: number, current: number, step: StepperStep): StepStatus {
  if (step.error) return 'error';
  if (index < current) return 'complete';
  if (index === current) return 'current';
  return 'upcoming';
}

const STATUS_TEXT: Record<StepStatus, string> = {
  complete: ', completed',
  current: ', current step',
  upcoming: ', upcoming',
  error: ', has errors',
};

export function Stepper({
  steps,
  currentStep,
  'aria-label': ariaLabel = 'Progress',
  orientation = 'horizontal',
  variant = 'full',
  shape = 'circle',
  onStepPress,
  className,
}: StepperProps) {
  const s = stepperStyles({ orientation });
  const current = Math.max(0, currentStep);
  const compact = variant === 'compact';

  const items = steps.map((step, index) => {
    const status = statusOf(index, current, step);
    const isCurrent = index === current;
    const pressable = !compact && Boolean(onStepPress) && index < current && !isCurrent;
    const parts = stepperStyles({ orientation, status, pressable, shape, done: index < current });

    const marker: ReactNode = status === 'complete' ? <Check /> : status === 'error' ? <Alert /> : index + 1;
    const body = (
      <>
        <span aria-hidden="true" className={parts.marker()}>
          {marker}
        </span>
        <span className={parts.text()}>
          <span className={parts.label()}>
            {step.label}
            {step.optional && <span className={parts.optional()}>Optional</span>}
            <span className="sr-only">
              {step.optional ? ', optional' : ''}
              {STATUS_TEXT[status]}
            </span>
          </span>
          {step.description && <span className={parts.description()}>{step.description}</span>}
        </span>
      </>
    );

    return (
      <li key={step.id} aria-current={isCurrent ? 'step' : undefined} className={parts.item()}>
        {pressable ? (
          <Button onPress={() => onStepPress?.(index)} className={parts.step()}>
            {body}
          </Button>
        ) : (
          <div className={parts.step()}>{body}</div>
        )}
        {index < steps.length - 1 && <span aria-hidden="true" className={parts.connector()} />}
      </li>
    );
  });

  if (compact) {
    const step = steps[Math.min(current, steps.length - 1)];
    return (
      <nav aria-label={ariaLabel} className={s.root({ className })}>
        <div className={s.compact()}>
          <p className={s.compactEyebrow()} aria-hidden="true">
            Step {Math.min(current + 1, steps.length)} of {steps.length}
          </p>
          {step && (
            <p className={s.compactTitle()} aria-hidden="true">
              {step.label}
            </p>
          )}
          <div className={s.bars()} aria-hidden="true">
            {steps.map((step, index) => (
              <span key={step.id} className={stepperStyles({ reached: index <= current }).bar()} />
            ))}
          </div>
        </div>
        {/* Assistive tech still gets the whole list with every state. */}
        <ol className="sr-only">{items}</ol>
      </nav>
    );
  }

  return (
    <nav aria-label={ariaLabel} className={s.root({ className })}>
      <ol className={s.list()}>{items}</ol>
    </nav>
  );
}

/**
 * Move focus to the new step's heading when the step changes (not on first render), so keyboard and
 * screen-reader users land on the new content instead of on a button that just disappeared.
 *
 *   const focus = useStepFocus(step);
 *   <h2 {...focus}>{title}</h2>
 */
export function useStepFocus<T extends HTMLElement = HTMLHeadingElement>(step: number) {
  const ref = useRef<T>(null);
  const previous = useRef(step);
  useEffect(() => {
    if (previous.current === step) return;
    previous.current = step;
    ref.current?.focus();
  }, [step]);
  return { ref, tabIndex: -1 as const };
}
