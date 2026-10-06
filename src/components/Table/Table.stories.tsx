import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SortDescriptor } from 'react-aria-components';
import { Badge } from '../Badge/Badge';
import { Cell, Column, Row, Table, TableBody, TableHeader } from './Table';

type Order = { id: string; customer: string; status: 'Paid' | 'Pending' | 'Refunded'; total: number };

const orders: Order[] = [
  { id: '1041', customer: 'Ada Lovelace', status: 'Paid', total: 1240 },
  { id: '1042', customer: 'Grace Hopper', status: 'Pending', total: 86.5 },
  { id: '1043', customer: 'Alan Turing', status: 'Paid', total: 312 },
  { id: '1044', customer: 'Katherine Johnson', status: 'Refunded', total: 54.99 },
  { id: '1045', customer: 'Margaret Hamilton', status: 'Paid', total: 2210 },
  { id: '1046', customer: 'Linus Torvalds', status: 'Pending', total: 19 },
  { id: '1047', customer: 'Barbara Liskov', status: 'Paid', total: 745.25 },
];

const tone = { Paid: 'success', Pending: 'neutral', Refunded: 'danger' } as const;
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function sortOrders(items: Order[], { column, direction }: SortDescriptor) {
  const key = column as keyof Order;
  return [...items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv));
    return direction === 'descending' ? -cmp : cmp;
  });
}

function OrdersTable({
  sortable = false,
  selectionMode = 'none',
  items = orders,
}: {
  sortable?: boolean;
  selectionMode?: 'none' | 'multiple';
  items?: Order[];
}) {
  const [sort, setSort] = useState<SortDescriptor>({ column: 'customer', direction: 'ascending' });
  const rows = sortable ? sortOrders(items, sort) : items;

  return (
    <Table
      aria-label="Orders"
      selectionMode={selectionMode}
      sortDescriptor={sortable ? sort : undefined}
      onSortChange={sortable ? setSort : undefined}
      className="w-[640px] max-w-full"
    >
      <TableHeader>
        <Column id="customer" isRowHeader allowsSorting={sortable}>
          Customer
        </Column>
        <Column id="status" allowsSorting={sortable}>
          Status
        </Column>
        <Column id="total" align="end" allowsSorting={sortable}>
          Total
        </Column>
      </TableHeader>
      <TableBody items={rows} emptyMessage="No orders yet">
        {(order) => (
          <Row id={order.id}>
            <Cell>{order.customer}</Cell>
            <Cell>
              <Badge tone={tone[order.status]}>{order.status}</Badge>
            </Cell>
            <Cell align="end">{money.format(order.total)}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}

const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { 'aria-label': 'Orders' },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <OrdersTable /> };

/** Click a column header, or focus it and press Enter, to sort. */
export const Sortable: Story = { render: () => <OrdersTable sortable /> };

/** Arrow keys move between cells; Space toggles the focused row's checkbox. */
export const Selectable: Story = { render: () => <OrdersTable sortable selectionMode="multiple" /> };

export const Empty: Story = { render: () => <OrdersTable items={[]} /> };
