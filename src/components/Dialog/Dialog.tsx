import { useId, type HTMLAttributes, type ReactNode } from 'react';
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
  type DialogProps as AriaDialogProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { IconButton } from '../IconButton/IconButton';

export const dialogStyles = tv({
  slots: {
    overlay:
      'fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-scrim p-4 data-[entering]:animate-fade-in motion-reduce:animate-none',
    modal:
      'w-full rounded-lg border border-border bg-surface font-sans text-text shadow-popover data-[entering]:animate-dialog-in motion-reduce:animate-none',
    dialog: 'relative flex flex-col gap-4 p-6 outline-hidden',
    title: 'pr-8 font-serif text-2xl font-medium leading-snug text-text',
    description: 'text-sm text-muted',
    footer: 'flex items-center justify-end gap-2 pt-2',
  },
  variants: {
    size: {
      sm: { modal: 'max-w-sm' },
      md: { modal: 'max-w-md' },
      lg: { modal: 'max-w-lg' },
    },
  },
  defaultVariants: { size: 'md' },
});

/** Wraps a trigger button and a <Dialog>. React Aria wires up aria-expanded and focus return. */
export { DialogTrigger };

export interface DialogProps
  extends Omit<AriaDialogProps, 'className' | 'children' | 'aria-label' | 'aria-labelledby'> {
  /** Required. Rendered as the heading and used as the dialog's accessible name. */
  title: string;
  /** Optional supporting text, linked to the dialog with aria-describedby. */
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether clicking outside closes the dialog. Defaults to true, but false for
   * `role="alertdialog"` so people must choose an action.
   */
  isDismissable?: boolean;
  /** Show the corner close button. Defaults to true, but false for `role="alertdialog"`. */
  showCloseButton?: boolean;
  className?: string;
  /** Content, or a function that receives `close` for custom action buttons. */
  children: ReactNode | ((options: { close: () => void }) => ReactNode);
}

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M3 3l10 10M13 3L3 13" />
  </svg>
);

export function Dialog({
  title,
  description,
  size,
  isDismissable,
  showCloseButton,
  className,
  children,
  role,
  'aria-describedby': describedBy,
  ...props
}: DialogProps) {
  const descriptionId = useId();
  const isAlert = role === 'alertdialog';
  const styles = dialogStyles({ size });

  return (
    <ModalOverlay isDismissable={isDismissable ?? !isAlert} className={styles.overlay()}>
      <Modal className={styles.modal()}>
        <AriaDialog
          {...props}
          role={role}
          aria-describedby={description ? descriptionId : describedBy}
          className={styles.dialog({ className })}
        >
          {(options) => (
            <>
              {(showCloseButton ?? !isAlert) && (
                <IconButton slot="close" aria-label="Close dialog" size="sm" className="absolute right-3 top-3">
                  <CloseIcon />
                </IconButton>
              )}
              <Heading slot="title" className={styles.title()}>
                {title}
              </Heading>
              {description && (
                <p id={descriptionId} className={styles.description()}>
                  {description}
                </p>
              )}
              {typeof children === 'function' ? children(options) : children}
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}

/** Right-aligned row for action buttons at the bottom of a dialog. */
export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={dialogStyles().footer({ className })} />;
}
