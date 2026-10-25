import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  args: { label: 'Uploading', value: 40, className: 'w-80' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['accent', 'success', 'danger'] },
    showValue: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
    isIndeterminate: { control: 'boolean' },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { value: 0 } };

export const Complete: Story = { args: { label: 'Upload complete', value: 100, tone: 'success' } };

export const Failed: Story = { args: { label: 'Upload failed', value: 62, tone: 'danger' } };

export const Indeterminate: Story = { args: { label: 'Preparing export', isIndeterminate: true } };

export const CustomValueText: Story = {
  args: { label: 'Files uploaded', value: 3, minValue: 0, maxValue: 10, valueLabel: '3 of 10 files' },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-5">
      <ProgressBar {...args} size="sm" label="Small" />
      <ProgressBar {...args} size="md" label="Medium" />
      <ProgressBar {...args} size="lg" label="Large" />
    </div>
  ),
};

export const HiddenLabel: Story = {
  args: { label: 'Page load progress', hideLabel: true, showValue: false, size: 'sm' },
};

/** Value updates are announced by screen readers as the bar moves. */
export const Animated: Story = {
  render: (args) => {
    const [value, setValue] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 5)), 600);
      return () => clearInterval(id);
    }, []);
    return <ProgressBar {...args} value={value} label="Syncing" tone={value === 100 ? 'success' : 'accent'} />;
  },
};
