import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio, RadioGroup } from './RadioGroup';

const plans = (
  <>
    <Radio value="free">Free</Radio>
    <Radio value="pro">Pro</Radio>
    <Radio value="team">Team</Radio>
  </>
);

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  args: { label: 'Billing plan', children: plans },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    isDisabled: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    children: { control: false },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultSelection: Story = { args: { defaultValue: 'pro' } };

export const Horizontal: Story = { args: { orientation: 'horizontal', defaultValue: 'free' } };

export const WithDescriptions: Story = {
  args: {
    label: 'Notification frequency',
    description: 'You can change this later in your settings.',
    defaultValue: 'daily',
    children: (
      <>
        <Radio value="realtime" description="A message for every event, as it happens.">
          Real time
        </Radio>
        <Radio value="daily" description="One summary each morning.">
          Daily digest
        </Radio>
        <Radio value="weekly" description="One summary every Monday.">
          Weekly digest
        </Radio>
      </>
    ),
  },
};

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Choose a plan to continue.' },
};

export const DisabledOption: Story = {
  args: {
    defaultValue: 'free',
    children: (
      <>
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="team" isDisabled>
          Team (contact sales)
        </Radio>
      </>
    ),
  },
};

export const Disabled: Story = { args: { isDisabled: true, defaultValue: 'pro' } };

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('pro');
    return (
      <div className="flex flex-col gap-4 font-sans text-sm text-text">
        <RadioGroup {...args} value={value} onChange={setValue} />
        <p className="text-muted">
          Selected: <span className="font-mono text-text">{value}</span>
        </p>
      </div>
    );
  },
};
