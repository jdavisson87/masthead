import type { ReactNode } from 'react';
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * Sharp, editorial switch: a squared track with a squared thumb (no pills).
 * Off state uses `border-strong` for 3:1+ contrast on the control boundary.
 */
export const switchStyles = tv({
  slots: {
    root: 'group inline-flex items-center gap-3 font-sans text-sm text-text data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    track:
      'flex h-6 w-11 shrink-0 items-center rounded-md border px-[3px] outline-hidden transition-colors motion-reduce:transition-none',
    thumb:
      'size-4 rounded-sm transition-transform motion-reduce:transition-none',
  },
  variants: {
    selected: {
      true: { track: 'border-accent bg-accent', thumb: 'translate-x-5 bg-accent-fg' },
      false: { track: 'border-border-strong bg-surface', thumb: 'translate-x-0 bg-border-strong' },
    },
    hovered: { true: {}, false: {} },
    focusVisible: {
      true: { track: 'outline-2 outline-offset-2 outline-accent' },
      false: {},
    },
  },
  compoundVariants: [
    { selected: false, hovered: true, class: { track: 'border-text bg-raised' } },
    { selected: true, hovered: true, class: { track: 'border-accent-hover bg-accent-hover' } },
  ],
  defaultVariants: { selected: false, hovered: false, focusVisible: false },
});

export interface SwitchProps extends Omit<AriaSwitchProps, 'className' | 'children'> {
  /** Label content. If omitted, provide `aria-label`. */
  children?: ReactNode;
  className?: string;
}

export function Switch({ children, className, ...props }: SwitchProps) {
  const styles = switchStyles();

  return (
    <AriaSwitch {...props} className={styles.root({ className })}>
      {({ isSelected, isHovered, isFocusVisible }) => {
        const s = switchStyles({ selected: isSelected, hovered: isHovered, focusVisible: isFocusVisible });
        return (
          <>
            <span className={s.track()}>
              <span className={s.thumb()} />
            </span>
            {children}
          </>
        );
      }}
    </AriaSwitch>
  );
}
