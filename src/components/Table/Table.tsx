import type { ReactNode } from 'react';
import {
  Cell as AriaCell,
  Collection,
  Column as AriaColumn,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  useTableOptions,
  type CellProps as AriaCellProps,
  type ColumnProps as AriaColumnProps,
  type RowProps as AriaRowProps,
  type SortDirection,
  type TableBodyProps as AriaTableBodyProps,
  type TableHeaderProps as AriaTableHeaderProps,
  type TableProps as AriaTableProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Checkbox } from '../Checkbox/Checkbox';

/**
 * Editorial table: 1px rules, mono uppercase column headers, no zebra striping.
 * React Aria provides the grid semantics, arrow-key navigation, sorting, and selection.
 */
export const tableStyles = tv({
  slots: {
    wrapper: 'overflow-x-auto rounded-lg border border-border bg-surface font-sans text-text',
    table: 'w-full border-collapse text-left text-sm outline-hidden',
    header: 'border-b border-border bg-raised',
    column: [
      'px-4 py-2.5 text-left font-mono text-xs font-medium uppercase tracking-wider text-muted outline-hidden',
      'data-[allows-sorting]:cursor-pointer data-[hovered]:text-text',
      'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-accent',
    ],
    columnInner: 'flex w-full items-center gap-1.5',
    row: [
      'border-b border-border outline-hidden last:border-b-0',
      'data-[hovered]:bg-raised data-[selected]:bg-raised',
      'data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-accent',
      'data-[disabled]:opacity-50',
    ],
    cell: 'px-4 py-3 outline-hidden data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-accent',
    empty: 'px-4 py-10 text-center text-sm text-muted',
  },
  variants: {
    align: {
      start: {},
      end: { column: 'text-right', columnInner: 'justify-end', cell: 'text-right tabular-nums' },
    },
  },
  defaultVariants: { align: 'start' },
});

/* ------------------------------ Table ------------------------------ */

export interface TableProps extends Omit<AriaTableProps, 'className'> {
  /** Required: a table needs an accessible name. */
  'aria-label': string;
  /** Applied to the scroll container that wraps the table. */
  className?: string;
}

export function Table({ className, ...props }: TableProps) {
  const styles = tableStyles();
  return (
    <div className={styles.wrapper({ className })}>
      <AriaTable {...props} className={styles.table()} />
    </div>
  );
}

/* ---------------------------- TableHeader --------------------------- */

export interface TableHeaderProps<T> extends Omit<AriaTableHeaderProps<T>, 'className'> {
  className?: string;
}

/** Adds the selection column automatically when the Table has a `selectionMode`. */
export function TableHeader<T extends object>({ columns, children, className, ...props }: TableHeaderProps<T>) {
  const { selectionBehavior, selectionMode } = useTableOptions();
  const styles = tableStyles();

  return (
    <AriaTableHeader {...props} className={styles.header({ className })}>
      {selectionBehavior === 'toggle' && (
        <AriaColumn className={styles.column({ class: 'w-10' })}>
          {selectionMode === 'multiple' && <Checkbox slot="selection" />}
        </AriaColumn>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaTableHeader>
  );
}

/* ------------------------------ Column ------------------------------ */

export interface ColumnProps extends Omit<AriaColumnProps, 'className' | 'children'> {
  children: ReactNode;
  /** Use `end` for numeric columns so digits line up. */
  align?: 'start' | 'end';
  className?: string;
}

const iconProps = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, 'aria-hidden': true } as const;

function SortIcon({ direction }: { direction: SortDirection | undefined }) {
  return (
    <svg {...iconProps} className={`size-3.5 shrink-0 ${direction ? 'text-text' : 'text-muted/60'}`}>
      {direction === 'ascending' && <path d="M8 13V3M4 7l4-4 4 4" />}
      {direction === 'descending' && <path d="M8 3v10M4 9l4 4 4-4" />}
      {!direction && <path d="M5 6l3-3 3 3M5 10l3 3 3-3" />}
    </svg>
  );
}

export function Column({ children, align, className, textValue, ...props }: ColumnProps) {
  const styles = tableStyles({ align });
  return (
    <AriaColumn
      {...props}
      textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
      className={styles.column({ className })}
    >
      {({ allowsSorting, sortDirection }) => (
        <span className={styles.columnInner()}>
          {children}
          {allowsSorting && <SortIcon direction={sortDirection} />}
        </span>
      )}
    </AriaColumn>
  );
}

/* ------------------------------- Body ------------------------------- */

export interface TableBodyProps<T> extends Omit<AriaTableBodyProps<T>, 'className' | 'renderEmptyState'> {
  className?: string;
  /** Shown when there are no rows. */
  emptyMessage?: ReactNode;
}

export function TableBody<T extends object>({ emptyMessage = 'No results', className, ...props }: TableBodyProps<T>) {
  const styles = tableStyles();
  return (
    <AriaTableBody
      {...props}
      className={className}
      renderEmptyState={() => <div className={styles.empty()}>{emptyMessage}</div>}
    />
  );
}

/* -------------------------------- Row ------------------------------- */

export interface RowProps<T> extends Omit<AriaRowProps<T>, 'className'> {
  className?: string;
}

/** Adds the selection checkbox cell automatically when the Table has a `selectionMode`. */
export function Row<T extends object>({ id, columns, children, className, ...props }: RowProps<T>) {
  const { selectionBehavior } = useTableOptions();
  const styles = tableStyles();

  return (
    <AriaRow id={id} {...props} className={styles.row({ className })}>
      {selectionBehavior === 'toggle' && (
        <AriaCell className={styles.cell()}>
          <Checkbox slot="selection" />
        </AriaCell>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaRow>
  );
}

/* ------------------------------- Cell ------------------------------- */

export interface CellProps extends Omit<AriaCellProps, 'className' | 'children'> {
  children: ReactNode;
  align?: 'start' | 'end';
  className?: string;
}

export function Cell({ children, align, className, ...props }: CellProps) {
  const styles = tableStyles({ align });
  return (
    <AriaCell {...props} className={styles.cell({ className })}>
      {children}
    </AriaCell>
  );
}
