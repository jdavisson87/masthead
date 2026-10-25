import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  args: { count: 20, page: 1, onPageChange: () => {}, 'aria-label': 'Results pages' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    siblings: { control: { type: 'number', min: 0, max: 3 } },
    boundaries: { control: { type: 'number', min: 1, max: 3 } },
  },
  render: function Render(args) {
    const [page, setPage] = useState(args.page);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const MiddleOfRange: Story = { args: { page: 10 } };
export const FewPages: Story = { args: { count: 5, page: 2 } };
export const WithSummary: Story = { args: { showSummary: true } };
export const Small: Story = { args: { size: 'sm' } };
export const WiderSiblings: Story = { args: { page: 10, siblings: 2 } };
export const AsLinks: Story = { args: { getHref: (p: number) => `#page-${p}` } };
export const Disabled: Story = { args: { isDisabled: true, page: 3 } };
