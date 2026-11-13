import { useEffect, useState, type ReactNode } from 'react';
import {
  Autocomplete,
  Dialog,
  Input,
  Keyboard,
  Menu,
  MenuItem,
  Modal,
  ModalOverlay,
  Text,
  TextField,
  useFilter,
  type Key,
  type MenuItemProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Kbd, useKeyboardShortcut } from '../Kbd/Kbd';
import { MenuSection, menuStyles, type MenuSectionProps } from '../Menu/Menu';

/**
 * A searchable list of actions in a modal, opened with a keyboard shortcut (Cmd/Ctrl+K by default).
 * Built on React Aria's Autocomplete: focus stays in the search input while the arrow keys move a
 * highlight through the results (aria-activedescendant), and the first match is highlighted as you
 * type, so Enter runs it.
 */
export const commandPaletteStyles = tv({
  slots: {
    overlay:
      'fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-scrim p-4 pt-[12vh] data-[entering]:animate-fade-in motion-reduce:animate-none',
    modal:
      'w-full max-w-xl overflow-hidden rounded-lg border border-overlay-border bg-overlay font-sans text-text shadow-popover data-[entering]:animate-dialog-in motion-reduce:animate-none',
    dialog: 'flex max-h-[min(32rem,76vh)] flex-col outline-hidden',
    search:
      'flex shrink-0 items-center gap-2.5 border-b-2 border-border px-4 text-muted transition-colors has-[[data-focused]]:border-accent',
    // No text color here: tailwind-merge would treat `text-body-md` and a `text-*` color as one group
    // and drop the size. The input inherits `text-text` from the modal.
    input: 'h-12 min-w-0 flex-1 bg-transparent text-body-md outline-hidden placeholder:text-muted',
    list: 'min-h-0 flex-1 overflow-auto p-1.5 text-sm outline-hidden',
    empty: 'px-3 py-8 text-center text-sm text-muted',
    footer:
      'flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2 font-mono text-xs text-muted',
    hint: 'inline-flex items-center gap-1.5',
  },
});

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="size-4 shrink-0">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

/** Rendered by the menu when nothing matches. Tells the palette so it can announce it. */
function EmptyState({ query, onShow, className }: { query: string; onShow: (shown: boolean) => void; className: string }) {
  useEffect(() => {
    onShow(true);
    return () => onShow(false);
  }, [onShow]);
  return <div className={className}>{query ? <>No results for “{query}”</>: 'No commands'}</div>;
}

export interface CommandPaletteProps {
  /** <CommandItem> and <CommandSection> elements. */
  children: ReactNode;
  /** Controlled open state. Leave out to let the palette manage it. */
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Called with the item's id when a command runs. The palette closes afterwards. */
  onAction?: (key: Key) => void;
  /** Keys that toggle the palette, as for <Kbd>. Defaults to ["mod", "K"]. Pass null to turn it off. */
  shortcut?: string[] | null;
  placeholder?: string;
  /** Accessible name for the dialog. */
  'aria-label'?: string;
  /** Accessible name for the search input. */
  searchLabel?: string;
  /** Replace the default filter (case-insensitive "contains"). Receives the item's text and the query. */
  filter?: (textValue: string, inputValue: string) => boolean;
  /** Show the keyboard hints row at the bottom. Defaults to true. */
  showHints?: boolean;
  className?: string;
}

export function CommandPalette({
  children,
  isOpen,
  defaultOpen = false,
  onOpenChange,
  onAction,
  shortcut = ['mod', 'K'],
  placeholder = 'Type a command or search…',
  'aria-label': ariaLabel = 'Command palette',
  searchLabel = 'Search commands',
  filter,
  showHints = true,
  className,
}: CommandPaletteProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (isOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const [query, setQuery] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);
  // Start fresh each time the palette opens.
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useKeyboardShortcut(shortcut ?? [], () => setOpen(!open), { enabled: shortcut != null, allowInInputs: true });

  const { contains } = useFilter({ sensitivity: 'base' });
  const styles = commandPaletteStyles();

  return (
    <ModalOverlay isOpen={open} onOpenChange={setOpen} isDismissable className={styles.overlay()}>
      <Modal className={styles.modal({ className })}>
        <Dialog aria-label={ariaLabel} className={styles.dialog()}>
          {({ close }) => (
            <>
              <Autocomplete filter={filter ?? contains} inputValue={query} onInputChange={setQuery}>
                <TextField aria-label={searchLabel} autoFocus className={styles.search()}>
                  <SearchIcon />
                  <Input placeholder={placeholder} className={styles.input()} />
                </TextField>
                <Menu
                  aria-label="Commands"
                  className={styles.list()}
                  onAction={(key) => {
                    onAction?.(key);
                    close();
                  }}
                  renderEmptyState={() => <EmptyState query={query} onShow={setIsEmpty} className={styles.empty()} />}
                >
                  {children}
                </Menu>
              </Autocomplete>
              {showHints && (
                // Visual reminder of the keys; screen readers already get combobox and menu semantics.
                <div aria-hidden className={styles.footer()}>
                  <span className={styles.hint()}>
                    <Kbd keys={['up']} size="sm" />
                    <Kbd keys={['down']} size="sm" />
                    to move
                  </span>
                  <span className={styles.hint()}>
                    <Kbd keys={['enter']} size="sm" />
                    to run
                  </span>
                  <span className={styles.hint()}>
                    <Kbd keys={['esc']} size="sm" />
                    to close
                  </span>
                </div>
              )}
              <div role="status" className="sr-only">
                {isEmpty ? (query ? `No results for “${query}”` : 'No commands') : ''}
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

export interface CommandItemProps extends Omit<MenuItemProps, 'className' | 'children'> {
  /** The command's name. */
  children: ReactNode;
  /** Secondary text under the name, announced as the item's description. */
  description?: string;
  /** Leading icon, hidden from assistive tech. */
  icon?: ReactNode;
  /** Extra words that should match this command ("dark", "light" for a theme toggle). Not shown or announced. */
  keywords?: string[];
  /** Keys for this command's own shortcut, shown with <Kbd>. Display only; bind it with useKeyboardShortcut. */
  shortcut?: string[];
  className?: string;
}

export function CommandItem({
  children,
  description,
  icon,
  keywords,
  shortcut,
  className,
  textValue,
  ...props
}: CommandItemProps) {
  const s = menuStyles();
  const label = textValue ?? (typeof children === 'string' ? children : undefined);
  return (
    <MenuItem
      {...props}
      // The filter matches on textValue, so keywords go there. The visible label still names the item.
      textValue={label && keywords?.length ? `${label} ${keywords.join(' ')}` : label}
      className={s.item({ className: ['py-2', className] })}
    >
      {icon && (
        <span aria-hidden="true" className={s.icon()}>
          {icon}
        </span>
      )}
      <span className={s.text()}>
        <Text slot="label" className={s.label()}>
          {children}
        </Text>
        {description && (
          <Text slot="description" className={s.description()}>
            {description}
          </Text>
        )}
      </span>
      {shortcut && (
        <Keyboard className="ml-4 shrink-0">
          <Kbd keys={shortcut} size="sm" />
        </Keyboard>
      )}
    </MenuItem>
  );
}

/** A titled group of commands. The title names the group for assistive tech; empty groups hide while filtering. */
export const CommandSection = MenuSection;
export type CommandSectionProps = MenuSectionProps;
