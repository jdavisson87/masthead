import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './IconButton';

const stroke = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75 } as const;

const CloseIcon = () => (
  <svg {...stroke}>
    <path d="M3 3l10 10M13 3L3 13" />
  </svg>
);
const PlusIcon = () => (
  <svg {...stroke}>
    <path d="M8 2v12M2 8h12" />
  </svg>
);
const TrashIcon = () => (
  <svg {...stroke}>
    <path d="M2.5 4.5h11M6 4.5V2.5h4v2M4 4.5l.6 9h6.8l.6-9" />
  </svg>
);

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { 'aria-label': 'Close', children: <CloseIcon />, intent: 'ghost', size: 'md' },
  argTypes: {
    intent: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    isDisabled: { control: 'boolean' },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = {};
export const Primary: Story = { args: { intent: 'primary', 'aria-label': 'Add item', children: <PlusIcon /> } };
export const Secondary: Story = { args: { intent: 'secondary' } };
export const Danger: Story = { args: { intent: 'danger', 'aria-label': 'Delete item', children: <TrashIcon /> } };
export const Disabled: Story = { args: { isDisabled: true } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} size="sm" />
      <IconButton {...args} size="md" />
      <IconButton {...args} size="lg" />
    </div>
  ),
};
