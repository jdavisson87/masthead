import type { ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button/Button';

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'aria-label'> {
  /**
   * Required. An icon-only button has no visible text, so it needs an accessible name
   * ("Close", "Delete item"). Making this required turns a common a11y bug into a type error.
   */
  'aria-label': string;
  /** The icon, usually an <svg>. It is hidden from assistive tech; the aria-label names the button. */
  children: ReactNode;
}

// Square footprints that match Button's heights, plus a matching icon size.
const square = { sm: 'size-8 px-0', md: 'size-10 px-0', lg: 'size-12 px-0' } as const;
const icon = { sm: '[&>svg]:size-4', md: '[&>svg]:size-5', lg: '[&>svg]:size-6' } as const;

export function IconButton({ intent = 'ghost', size = 'md', className, children, ...props }: IconButtonProps) {
  const s = size ?? 'md';
  return (
    <Button {...props} intent={intent} size={s} className={`${square[s]} ${className ?? ''}`}>
      <span aria-hidden="true" className={`inline-flex ${icon[s]}`}>
        {children}
      </span>
    </Button>
  );
}
