import { useState, type ReactNode } from 'react';
import { tv } from 'tailwind-variants';
import { IconButton } from '../IconButton/IconButton';

/**
 * A full-width banner for site-wide news: breaking stories, service notices, corrections.
 * Severity is carried by an icon and a text label as well as color. A "critical" banner uses
 * role="alert" (announced immediately); the others use role="status" (announced politely).
 */
export const bannerStyles = tv({
  slots: {
    root: 'flex w-full items-start gap-3 border-y border-r border-border border-l-4 bg-surface px-4 py-3 font-sans text-body-sm text-text',
    icon: 'mt-0.5 size-4 shrink-0',
    body: 'flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1',
    label: 'font-mono text-body-xs font-semibold uppercase tracking-[0.12em]',
    text: 'min-w-0',
    actions: 'flex shrink-0 items-center gap-2',
  },
  variants: {
    severity: {
      info: { root: 'border-l-accent', icon: 'text-accent', label: 'text-accent' },
      success: { root: 'border-l-success', icon: 'text-success', label: 'text-success' },
      critical: { root: 'border-l-danger', icon: 'text-danger', label: 'text-danger' },
    },
  },
  defaultVariants: { severity: 'info' },
});

export type BannerSeverity = 'info' | 'success' | 'critical';

const DEFAULT_LABEL: Record<BannerSeverity, string> = { info: 'Notice', success: 'Update', critical: 'Breaking' };

const svg = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

function SeverityIcon({ severity, className }: { severity: BannerSeverity; className: string }) {
  if (severity === 'success')
    return (
      <svg {...svg} className={className}>
        <circle cx="8" cy="8" r="6.25" />
        <path d="M5.25 8.25l1.9 1.9 3.6-4" />
      </svg>
    );
  if (severity === 'critical')
    return (
      <svg {...svg} className={className}>
        <path d="M8 1.75l6.5 11.5h-13z" />
        <path d="M8 6.5v3M8 11.5v.01" />
      </svg>
    );
  return (
    <svg {...svg} className={className}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v3.5M8 5v.01" />
    </svg>
  );
}

const Cross = () => (
  <svg {...svg} className="size-4">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

export interface BannerProps {
  children: ReactNode;
  severity?: BannerSeverity;
  /** Short label before the message. Defaults to "Notice", "Update" or "Breaking". Pass "" to hide it. */
  label?: string;
  /** A link or button shown after the message, e.g. "Follow live updates". */
  action?: ReactNode;
  /** Adds a dismiss button and calls this when it is pressed. Move focus somewhere sensible here. */
  onDismiss?: () => void;
  className?: string;
}

export function Banner({ children, severity = 'info', label, action, onDismiss, className }: BannerProps) {
  const [open, setOpen] = useState(true);
  const s = bannerStyles({ severity });
  const text = label ?? DEFAULT_LABEL[severity];

  if (!open) return null;

  return (
    <div role={severity === 'critical' ? 'alert' : 'status'} className={s.root({ className })}>
      <SeverityIcon severity={severity} className={s.icon()} />
      <div className={s.body()}>
        {text && <strong className={s.label()}>{text}</strong>}
        <div className={s.text()}>{children}</div>
      </div>
      {(action || onDismiss) && (
        <div className={s.actions()}>
          {action}
          {onDismiss && (
            <IconButton
              size="sm"
              aria-label="Dismiss"
              onPress={() => {
                setOpen(false);
                onDismiss();
              }}
            >
              <Cross />
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
}
