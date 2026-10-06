import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SortDescriptor } from 'react-aria-components';
import { axe } from 'vitest-axe';
import { Cell, Column, Row, Table, TableBody, TableHeader, type TableProps } from './Table';

function Example(props: Partial<TableProps>) {
  return (
    <Table aria-label="Team" {...props}>
      <TableHeader>
        <Column id="name" isRowHeader>
          Name
        </Column>
        <Column id="role">Role</Column>
        <Column id="age" align="end">
          Age
        </Column>
      </TableHeader>
      <TableBody>
        <Row id="ada">
          <Cell>Ada</Cell>
          <Cell>Mathematician</Cell>
          <Cell align="end">36</Cell>
        </Row>
        <Row id="grace">
          <Cell>Grace</Cell>
          <Cell>Admiral</Cell>
          <Cell align="end">85</Cell>
        </Row>
        <Row id="alan">
          <Cell>Alan</Cell>
          <Cell>Computer scientist</Cell>
          <Cell align="end">41</Cell>
        </Row>
      </TableBody>
    </Table>
  );
}

const people = [
  { id: 'grace', name: 'Grace', role: 'Admiral' },
  { id: 'ada', name: 'Ada', role: 'Mathematician' },
  { id: 'alan', name: 'Alan', role: 'Computer scientist' },
];

function SortableExample({ onSortChange }: { onSortChange?: (d: SortDescriptor) => void }) {
  const [sort, setSort] = useState<SortDescriptor>({ column: 'name', direction: 'ascending' });
  const rows = [...people].sort((a, b) => {
    const key = sort.column as 'name' | 'role';
    const cmp = a[key].localeCompare(b[key]);
    return sort.direction === 'descending' ? -cmp : cmp;
  });
  return (
    <Table
      aria-label="Team"
      sortDescriptor={sort}
      onSortChange={(d) => {
        setSort(d);
        onSortChange?.(d);
      }}
    >
      <TableHeader>
        <Column id="name" isRowHeader allowsSorting>
          Name
        </Column>
        <Column id="role" allowsSorting>
          Role
        </Column>
      </TableHeader>
      <TableBody items={rows}>
        {(p) => (
          <Row id={p.id}>
            <Cell>{p.name}</Cell>
            <Cell>{p.role}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}

describe('Table', () => {
  it('is a grid named by its aria-label', () => {
    render(<Example />);
    expect(screen.getByRole('grid', { name: 'Team' })).toBeInTheDocument();
  });

  it('renders column headers, row headers, and cells', () => {
    render(<Example />);
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.getByRole('rowheader', { name: 'Ada' })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: 'Mathematician' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4); // header row + 3 data rows
  });

  it('shows the empty message when there are no rows', () => {
    render(
      <Table aria-label="Team">
        <TableHeader>
          <Column id="name" isRowHeader>
            Name
          </Column>
        </TableHeader>
        <TableBody emptyMessage="Nobody here yet">{[]}</TableBody>
      </Table>,
    );
    expect(screen.getByText('Nobody here yet')).toBeInTheDocument();
  });

  describe('sorting', () => {
    it('exposes the sort direction with aria-sort', () => {
      render(<SortableExample />);
      expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
      expect(screen.getByRole('columnheader', { name: /Role/ })).not.toHaveAttribute('aria-sort', 'ascending');
    });

    it('sorts when a column header is clicked', async () => {
      const onSortChange = vi.fn();
      render(<SortableExample onSortChange={onSortChange} />);
      const rows = () => screen.getAllByRole('row');
      expect(rows()[1]).toHaveTextContent('Ada');

      await userEvent.click(screen.getByRole('columnheader', { name: /Name/ }));
      expect(onSortChange).toHaveBeenLastCalledWith({ column: 'name', direction: 'descending' });
      expect(rows()[1]).toHaveTextContent('Grace');
      expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending');
    });

    it('sorts from the keyboard', async () => {
      const onSortChange = vi.fn();
      render(<SortableExample onSortChange={onSortChange} />);
      const header = screen.getByRole('columnheader', { name: /Role/ });
      await act(async () => header.focus());
      await userEvent.keyboard('{Enter}');
      expect(onSortChange).toHaveBeenLastCalledWith({ column: 'role', direction: 'ascending' });
    });
  });

  describe('selection', () => {
    it('adds a select-all checkbox and one checkbox per row', () => {
      render(<Example selectionMode="multiple" />);
      expect(screen.getByRole('checkbox', { name: /select all/i })).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    });

    it('reports the selected rows', async () => {
      const onSelectionChange = vi.fn();
      render(<Example selectionMode="multiple" onSelectionChange={onSelectionChange} />);
      await userEvent.click(screen.getAllByRole('checkbox')[1]!);
      // React Stately passes its own Set subclass, so compare the contents, not the type.
      const selection = onSelectionChange.mock.lastCall?.[0] as Set<string>;
      expect([...selection]).toEqual(['ada']);
    });

    it('selects every row with select-all', async () => {
      const onSelectionChange = vi.fn();
      render(<Example selectionMode="multiple" onSelectionChange={onSelectionChange} />);
      await userEvent.click(screen.getByRole('checkbox', { name: /select all/i }));
      expect(onSelectionChange).toHaveBeenLastCalledWith('all');
    });

    it('does not render checkboxes without a selection mode', () => {
      render(<Example />);
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });
  });

  it.each([
    ['plain', <Example key="a" />],
    ['sortable', <SortableExample key="b" />],
    ['selectable', <Example key="c" selectionMode="multiple" />],
  ])('has no axe violations (%s)', async (_name, ui) => {
    const { container } = render(ui);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
