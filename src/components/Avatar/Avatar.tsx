import { useState, type ReactNode } from 'react';
import { tv } from 'tailwind-variants';

/**
 * An avatar is one image that names a person. It renders as a single `role="img"` labelled with the
 * person's name; the photo and the initials inside are hidden from assistive tech so the name is
 * announced once. The photo shows only after it has loaded, and initials stand in while it loads
 * or if it fails, so there is never a broken-image icon.
 */
export const avatarStyles = tv({
  slots: {
    root: 'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden border border-border bg-raised align-middle font-sans font-medium text-text',
    image: 'absolute inset-0 size-full object-cover',
    initials: 'uppercase leading-none tracking-wide',
  },
  variants: {
    size: {
      xs: { root: 'size-6', initials: 'text-[0.625rem]' },
      sm: { root: 'size-8', initials: 'text-xs' },
      md: { root: 'size-10', initials: 'text-sm' },
      lg: { root: 'size-14', initials: 'text-base' },
      xl: { root: 'size-20', initials: 'text-xl' },
    },
    shape: {
      circle: { root: 'rounded-full' },
      square: { root: 'rounded-sm' },
    },
  },
  defaultVariants: { size: 'md', shape: 'circle' },
});

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'square';

/** First letter of the first and last word: "Jane Q. Doe" becomes "JD". Falls back to "?". */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = Array.from(words[0] as string)[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1] as string)[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export interface AvatarProps {
  /** The person's full name. Used for the initials and as the accessible name. */
  name: string;
  /** Photo URL. Optional: without it (or if it fails to load) the initials are shown. */
  src?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /**
   * Hide the avatar from assistive tech. Use when the name is already printed next to it
   * (a byline, a comment header), so it isn't read twice.
   */
  decorative?: boolean;
  className?: string;
}

export function Avatar({ name, src, size = 'md', shape = 'circle', decorative = false, className }: AvatarProps) {
  // Keyed by src so a new URL starts from "loading" again.
  return <AvatarInner key={src ?? ''} name={name} src={src} size={size} shape={shape} decorative={decorative} className={className} />;
}

function AvatarInner({ name, src, size, shape, decorative, className }: AvatarProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error');
  const s = avatarStyles({ size, shape });

  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'img' as const, 'aria-label': name };

  let image: ReactNode = null;
  if (src && status !== 'error') {
    image = (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={s.image({ className: status === 'loaded' ? '' : 'invisible' })}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    );
  }

  return (
    <span {...a11y} className={s.root({ className })}>
      {status !== 'loaded' && (
        <span aria-hidden="true" className={s.initials()}>
          {getInitials(name)}
        </span>
      )}
      {image}
    </span>
  );
}

export interface AvatarGroupPerson {
  name: string;
  src?: string;
}

export interface AvatarGroupProps {
  people: AvatarGroupPerson[];
  /** Most avatars to show; the rest collapse into a "+N" count. */
  max?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Names the group, e.g. "Authors" or "Reviewers". */
  'aria-label'?: string;
  className?: string;
}

const overlap: Record<AvatarSize, string> = {
  xs: '-space-x-1.5',
  sm: '-space-x-2',
  md: '-space-x-2.5',
  lg: '-space-x-3.5',
  xl: '-space-x-5',
};

export function AvatarGroup({ people, max = 4, size = 'md', shape = 'circle', 'aria-label': ariaLabel = 'People', className }: AvatarGroupProps) {
  const limit = Math.max(1, max);
  const overflow = people.length > limit ? people.length - (limit - 1) : 0;
  // When something overflows, the "+N" chip takes the last slot so the row is never wider than `max`.
  const shown = overflow > 0 ? people.slice(0, limit - 1) : people;
  const s = avatarStyles({ size, shape });

  if (people.length === 0) return null;

  return (
    <ul aria-label={ariaLabel} className={`m-0 flex list-none items-center p-0 ${overlap[size]} ${className ?? ''}`}>
      {shown.map((p, i) => (
        <li key={`${p.name}-${i}`} className="flex rounded-[inherit]">
          <Avatar name={p.name} src={p.src} size={size} shape={shape} className="ring-2 ring-bg" />
        </li>
      ))}
      {overflow > 0 && (
        <li className="flex">
          <span className={s.root({ className: 'ring-2 ring-bg' })}>
            <span aria-hidden="true" className="text-xs font-medium">
              +{overflow}
            </span>
            <span className="sr-only">and {overflow} more</span>
          </span>
        </li>
      )}
    </ul>
  );
}
