import type { HTMLAttributes } from 'react';
import { tv } from 'tailwind-variants';

/**
 * Editorial card: a 1px border and small radius, no shadow.
 * Built as a composition so consumers control structure and heading level.
 */
export const cardStyles = tv({
  slots: {
    root: 'overflow-hidden rounded-lg border border-border bg-surface font-sans text-text',
    header: 'flex flex-col gap-1 border-b border-border px-5 py-4',
    title: 'font-serif text-xl font-medium leading-snug text-text',
    description: 'text-sm text-muted',
    content: 'px-5 py-4 text-sm',
    footer: 'flex items-center justify-end gap-2 border-t border-border bg-raised px-5 py-3',
  },
});

const styles = cardStyles();

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={styles.root({ className })} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={styles.header({ className })} />;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level, 1-6. Pick the level that fits the page outline. Defaults to 3. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function CardTitle({ level = 3, className, ...props }: CardTitleProps) {
  const Heading = `h${level}` as const;
  return <Heading {...props} className={styles.title({ className })} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={styles.description({ className })} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={styles.content({ className })} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={styles.footer({ className })} />;
}
