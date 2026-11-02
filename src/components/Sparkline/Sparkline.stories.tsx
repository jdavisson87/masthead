import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sparkline } from './Sparkline';

const visitors = [120, 132, 101, 134, 190, 230, 210, 245, 260, 240, 290, 310];

const meta = {
  title: 'Data/Sparkline',
  component: Sparkline,
  args: { data: visitors, label: 'Daily visitors', variant: 'line', tone: 'accent', width: 120, height: 32, showEndpoint: true },
  argTypes: {
    variant: { control: 'inline-radio', options: ['line', 'area', 'bars'] },
    tone: { control: 'inline-radio', options: ['accent', 'muted', 'success', 'danger'] },
  },
} satisfies Meta<typeof Sparkline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {};
export const Area: Story = { args: { variant: 'area' } };
export const Bars: Story = { args: { variant: 'bars' } };
export const Falling: Story = { args: { data: [...visitors].reverse(), tone: 'danger', label: 'Churn' } };
export const WithNegatives: Story = { args: { data: [3, -2, 4, -5, 2, 6, -1], variant: 'bars', label: 'Net change' } };
export const Large: Story = { args: { width: 320, height: 80, variant: 'area' } };
export const InText: Story = {
  render: (args) => (
    <p className="m-0 text-body-md text-text">
      Visitors this quarter <Sparkline {...args} width={80} height={20} /> are climbing.
    </p>
  ),
};
