import type { ReactNode } from 'react';
import { Link as AriaLink, RouterProvider, type LinkProps as AriaLinkProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * Links are always underlined: color alone is not enough to tell a link from the text around it (WCAG 1.4.1).
 * The size and font are inherited, so a Link drops into a paragraph, a heading or a nav without restyling.
 * State comes from React Aria's data attributes (data-hovered, data-focus-visible, data-disabled, data-current).
 */
export const linkStyles = tv({
  base: [
    'cursor-pointer rounded-sm underline decoration-1 underline-offset-4 outline-hidden transition-colors motion-reduce:transition-none',
    'data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-accent',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    'data-[current]:font-semibold',
  ],
  variants: {
    intent: {
      /** Accent-colored, for links inside running text. */
      inline: 'text-accent decoration-accent data-[hovered]:text-accent-hover data-[hovered]:decoration-2',
      /** Same color as the surrounding text with a quiet underline, for navigation and footers. */
      subtle: 'text-text decoration-border-strong data-[hovered]:text-accent data-[hovered]:decoration-accent',
    },
  },
  defaultVariants: { intent: 'inline' },
});

const ExternalIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="ml-0.5 inline-block size-[0.8em] align-baseline"
  >
    <path d="M5 11l6-6M6 5h5v5" />
  </svg>
);

export interface LinkProps extends Omit<AriaLinkProps, 'className' | 'children'> {
  children: ReactNode;
  intent?: 'inline' | 'subtle';
  className?: string;
}

/**
 * A link to a URL (renders an <a>) or, without `href`, an accessible action (role="link") that fires `onPress`.
 * With `target="_blank"` it adds `rel="noopener noreferrer"` unless you set `rel`, an external-link icon,
 * and a screen-reader note that it opens in a new tab.
 */
export function Link({ children, intent = 'inline', className, target, rel, ...props }: LinkProps) {
  const opensNewTab = target === '_blank';
  return (
    <AriaLink
      {...props}
      target={target}
      rel={rel ?? (opensNewTab ? 'noopener noreferrer' : undefined)}
      className={linkStyles({ intent, className })}
    >
      {children}
      {opensNewTab && (
        <>
          <ExternalIcon />
          {/* Starts with a comma, not a space: whitespace around a visually hidden span is collapsed unpredictably. */}
          <span className="sr-only">, opens in a new tab</span>
        </>
      )}
    </AriaLink>
  );
}

/**
 * Makes every Link in the tree navigate through your router instead of reloading the page.
 * Pass your router's `navigate` function (and optionally `useHref`). See the React Aria client-side routing guide.
 */
export { RouterProvider };
