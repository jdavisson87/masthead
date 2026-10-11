import type { ReactNode } from 'react';
import { useTheme } from '../../theme/useTheme';
import { Switch } from '../Switch/Switch';

export interface ContrastToggleProps {
  /** Label text. Defaults to "Increase contrast". */
  children?: ReactNode;
  className?: string;
}

/**
 * Switch for the increased-contrast mode: stronger colors, thicker control borders and focus rings.
 * Starts on when the OS asks for more contrast; the user's explicit choice then takes over and is saved.
 */
export function ContrastToggle({ children = 'Increase contrast', className }: ContrastToggleProps) {
  const { contrast, setContrast } = useTheme();
  return (
    <Switch isSelected={contrast} onChange={setContrast} className={className}>
      {children}
    </Switch>
  );
}
