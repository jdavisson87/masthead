import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'Beta', tone: 'neutral' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'accent', 'success', 'danger'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Accent: Story = { args: { tone: 'accent', children: 'New' } };
export const Success: Story = { args: { tone: 'success', children: 'Live' } };
export const Danger: Story = { args: { tone: 'danger', children: 'Failed' } };

export const AllTones: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge>Draft</Badge>
      <Badge tone="accent">New</Badge>
      <Badge tone="success">Live</Badge>
      <Badge tone="danger">Failed</Badge>
    </div>
  ),
};
