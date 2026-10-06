import {
  Text,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as ToastRegion,
  type QueuedToast,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';

/*
 * React Aria still exports its toast API under UNSTABLE_ names. They are imported (and renamed)
 * only in this file, so if React Aria renames them there is one place to update.
 */

export type ToastTone = 'neutral' | 'accent' | 'success' | 'danger';

export interface ToastContentData {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Optional action, such as "Undo". Pressing it runs the callback and dismisses the toast. */
  action?: { label: string; onPress: () => void };
}

/** The single queue behind `toast.*` and `<Toaster />`. */
export const toastQueue = new ToastQueue<ToastContentData>({ maxVisibleToasts: 5 });

export const toastStyles = tv({
  slots: {
    region:
      'fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 outline-hidden data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-accent',
    toast: [
      'flex items-start gap-3 rounded-lg border border-l-[3px] border-border bg-surface p-4 font-sans text-text shadow-popover outline-hidden',
      'animate-dialog-in motion-reduce:animate-none',
      'data-[focus-visible]:outline-2 data-[focus-visible]:outline-accent',
    ],
    icon: 'mt-0.5 size-4 shrink-0',
    content: 'flex min-w-0 flex-1 flex-col',
    title: 'text-sm font-medium',
    description: 'mt-0.5 text-sm text-muted',
  },
  variants: {
    tone: {
      neutral: { toast: 'border-l-muted', icon: 'text-muted' },
      accent: { toast: 'border-l-accent', icon: 'text-accent' },
      success: { toast: 'border-l-success', icon: 'text-success' },
      danger: { toast: 'border-l-danger', icon: 'text-danger' },
    },
  },
  defaultVariants: { tone: 'neutral' },
});

const stroke = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, 'aria-hidden': true } as const;

/** Tone is shown with an icon as well as color, so meaning never depends on color alone. */
function ToneIcon({ tone, className }: { tone: ToastTone; className: string }) {
  if (tone === 'neutral') return null;
  return (
    <svg {...stroke} className={className}>
      {tone === 'success' && (
        <>
          <circle cx="8" cy="8" r="6.25" />
          <path d="M5.5 8.2l1.8 1.8 3.2-3.6" />
        </>
      )}
      {tone === 'danger' && (
        <>
          <path d="M8 2l6.5 11.5h-13z" />
          <path d="M8 6.5v3M8 11.5v.01" />
        </>
      )}
      {tone === 'accent' && (
        <>
          <circle cx="8" cy="8" r="6.25" />
          <path d="M8 7.2v3.8M8 5v.01" />
        </>
      )}
    </svg>
  );
}

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M3 3l10 10M13 3L3 13" />
  </svg>
);

function ToastItem({ toast: queued }: { toast: QueuedToast<ToastContentData> }) {
  const { title, description, tone = 'neutral', action } = queued.content;
  const styles = toastStyles({ tone });

  return (
    <AriaToast toast={queued} className={styles.toast()}>
      <ToneIcon tone={tone} className={styles.icon()} />
      <ToastContent className={styles.content()}>
        <Text slot="title" className={styles.title()}>
          {title}
        </Text>
        {description && (
          <Text slot="description" className={styles.description()}>
            {description}
          </Text>
        )}
        {action && (
          <Button
            intent="secondary"
            size="sm"
            className="mt-3 self-start"
            onPress={() => {
              action.onPress();
              toastQueue.close(queued.key);
            }}
          >
            {action.label}
          </Button>
        )}
      </ToastContent>
      <IconButton slot="close" aria-label="Dismiss notification" size="sm">
        <CloseIcon />
      </IconButton>
    </AriaToast>
  );
}

/**
 * Mount once near the root of your app. It renders a labelled notifications region (reachable
 * with F6), pauses timers while hovered or focused, and announces new toasts to screen readers.
 */
export function Toaster({ className }: { className?: string }) {
  const styles = toastStyles();
  return (
    <ToastRegion queue={toastQueue} className={styles.region({ className })}>
      {({ toast: queued }) => <ToastItem toast={queued} />}
    </ToastRegion>
  );
}

export interface ShowToastOptions {
  description?: string;
  action?: ToastContentData['action'];
  /**
   * Milliseconds before auto-dismiss. Defaults: 5s, 8s for errors, 10s when there is an action.
   * Pass 0 to keep the toast until it is dismissed.
   */
  timeout?: number;
  onClose?: () => void;
}

function show(tone: ToastTone, title: string, options: ShowToastOptions = {}): string {
  const { timeout, onClose, ...content } = options;
  const fallback = content.action ? 10_000 : tone === 'danger' ? 8_000 : 5_000;
  return toastQueue.add({ title, tone, ...content }, { timeout: timeout ?? fallback, onClose });
}

/** Call from anywhere, with no provider or hook needed. Requires a mounted <Toaster />. */
export const toast = {
  show: (title: string, options?: ShowToastOptions) => show('neutral', title, options),
  info: (title: string, options?: ShowToastOptions) => show('accent', title, options),
  success: (title: string, options?: ShowToastOptions) => show('success', title, options),
  error: (title: string, options?: ShowToastOptions) => show('danger', title, options),
  close: (key: string) => toastQueue.close(key),
  clear: () => toastQueue.clear(),
};
