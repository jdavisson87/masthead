import type { Meta, StoryObj } from '@storybook/react-vite';
import { PullQuote } from './PullQuote';

const meta = {
  title: 'Editorial/Pull Quote',
  component: PullQuote,
  args: {
    children: 'Weekend service is not a luxury. For half our riders it is the only service that matters.',
    attribution: 'Jane Doe, transit chair',
    source: 'Budget hearing',
    size: 'md',
    align: 'start',
    rule: true,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'lg'] },
    align: { control: 'inline-radio', options: ['start', 'center'] },
  },
  decorators: [(Story) => <div className="p-xl"><Story /></div>],
} satisfies Meta<typeof PullQuote>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Large: Story = { args: { size: 'lg' } };
export const Centered: Story = { args: { size: 'lg', align: 'center' } };
export const NoRule: Story = { args: { rule: false } };
export const NoAttribution: Story = { args: { attribution: undefined, source: undefined } };
