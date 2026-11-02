import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stat } from './Stat';
import { Delta } from './Delta';
import { Card } from '../Card/Card';

const revenue = [31, 34, 33, 38, 41, 40, 45, 48];

const meta = {
  title: 'Data/Stat',
  component: Stat,
  args: { label: 'Revenue', value: '$48,200', delta: 12.5, period: 'vs last month', trend: revenue, size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['md', 'lg'] } },
} satisfies Meta<typeof Stat>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Large: Story = { args: { size: 'lg' } };
export const Decrease: Story = { args: { label: 'Active users', value: '8,412', delta: -4.2, trend: [...revenue].reverse() } };
export const LowerIsBetter: Story = {
  args: { label: 'Error rate', value: '0.8%', delta: -18, invertDelta: true, trend: [5, 4, 4, 3, 3, 2, 2, 1], hint: 'Fewer failed requests' },
};
export const Flat: Story = { args: { label: 'Subscribers', value: '2,040', delta: 0, trend: undefined } };
export const NoChange: Story = { args: { delta: undefined, trend: undefined, period: undefined, hint: 'Updated 5 minutes ago' } };

export const Dashboard: Story = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
      <Card><Stat label="Revenue" value="$48,200" delta={12.5} period="vs last month" trend={revenue} /></Card>
      <Card><Stat label="Active users" value="8,412" delta={-4.2} period="vs last month" trend={[...revenue].reverse()} /></Card>
      <Card><Stat label="Error rate" value="0.8%" delta={-18} invertDelta period="vs last month" trend={[5, 4, 4, 3, 3, 2, 2, 1]} /></Card>
    </div>
  ),
};

export const DeltaOnly: Story = {
  render: () => (
    <div className="flex flex-col gap-2 text-text">
      <Delta value={12.5} period="vs last month" />
      <Delta value={-3.1} period="vs last month" />
      <Delta value={-3.1} invert period="vs last month" />
      <Delta value={0} period="vs last month" />
      <Delta value={1500} format="number" precision={0} size="md" />
    </div>
  ),
};
