import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from 'react-aria-components';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { TextField } from '../TextField/TextField';
import { Popover, PopoverDialog, PopoverTrigger, type PopoverProps } from './Popover';

/** Story-only controls on top of Popover's own props, so the text can be edited in Storybook. */
type DemoArgs = PopoverProps & {
  triggerLabel: string;
  content: string;
  title: string;
};

const meta: Meta<DemoArgs> = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  args: {
    triggerLabel: 'About this chart',
    content: 'Revenue is shown in USD and updates every hour. Refunds are excluded.',
    title: 'Filter orders',
  },
  argTypes: {
    triggerLabel: { control: 'text', description: 'Story only: text on the trigger button' },
    content: { control: 'text', description: 'Story only: text inside the popover' },
    title: { control: 'text', description: 'Story only: heading inside the popover' },
    placement: {
      control: 'select',
      options: ['bottom', 'bottom start', 'bottom end', 'top', 'top start', 'top end', 'left', 'right'],
    },
  },
  parameters: { controls: { include: ['triggerLabel', 'content', 'title', 'placement'] } },
};

export default meta;
type Story = StoryObj<DemoArgs>;

export const Default: Story = {
  parameters: { controls: { include: ['triggerLabel', 'content', 'placement'] } },
  render: ({ triggerLabel, content, title: _title, ...popoverProps }) => (
    <PopoverTrigger>
      <Button intent="secondary">{triggerLabel}</Button>
      <Popover {...popoverProps} className="max-w-64">
        <PopoverDialog aria-label={triggerLabel}>{content}</PopoverDialog>
      </Popover>
    </PopoverTrigger>
  ),
};

/** The title heading gives the dialog its accessible name. */
export const WithForm: Story = {
  args: { placement: 'bottom start', triggerLabel: 'Filters' },
  parameters: { controls: { include: ['triggerLabel', 'title', 'placement'] } },
  render: ({ triggerLabel, content: _content, title, ...popoverProps }) => (
    <PopoverTrigger>
      <Button>{triggerLabel}</Button>
      <Popover {...popoverProps}>
        <PopoverDialog className="flex w-72 flex-col gap-4">
          <Heading slot="title" className="font-serif text-lg font-medium">
            {title}
          </Heading>
          <TextField label="Customer" placeholder="Search by name" />
          <Checkbox>Only show refunded</Checkbox>
          <Button size="sm">Apply</Button>
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
  ),
};

export const Placements: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex min-h-64 items-center justify-center gap-4">
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <PopoverTrigger key={placement}>
          <Button intent="secondary" size="sm">
            {placement}
          </Button>
          <Popover placement={placement}>
            <PopoverDialog aria-label={`Popover placed ${placement}`}>Placed {placement}</PopoverDialog>
          </Popover>
        </PopoverTrigger>
      ))}
    </div>
  ),
};
