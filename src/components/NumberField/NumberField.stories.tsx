import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberField } from './NumberField';

const meta = {
  title: 'Components/NumberField',
  component: NumberField,
  tags: ['autodocs'],
  args: { label: 'Quantity', defaultValue: 1, minValue: 0, className: 'w-48' },
  argTypes: {
    hideSteppers: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    isRequired: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    isWheelDisabled: { control: 'boolean' },
  },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMinAndMax: Story = {
  args: { label: 'Guests', defaultValue: 2, minValue: 1, maxValue: 8, description: 'Between 1 and 8.' },
};

export const Step: Story = {
  args: { label: 'Budget', defaultValue: 50, step: 5, minValue: 0, description: 'Arrow keys move by 5. Shift+PageUp moves by more.' },
};

export const Currency: Story = {
  args: {
    label: 'Price',
    defaultValue: 49.99,
    minValue: 0,
    formatOptions: { style: 'currency', currency: 'USD' },
    className: 'w-56',
  },
};

export const Percent: Story = {
  args: { label: 'Discount', defaultValue: 0.15, minValue: 0, maxValue: 1, step: 0.01, formatOptions: { style: 'percent' } },
};

export const Units: Story = {
  args: { label: 'Weight', defaultValue: 12, formatOptions: { style: 'unit', unit: 'kilogram' }, className: 'w-56' },
};

export const NoSteppers: Story = { args: { hideSteppers: true, placeholder: 'Enter a number' } };

export const Required: Story = { args: { isRequired: true, defaultValue: undefined, description: 'Required field.' } };

export const Invalid: Story = {
  args: { isInvalid: true, defaultValue: 0, errorMessage: 'Order at least 1.' },
};

export const Disabled: Story = { args: { isDisabled: true, defaultValue: 3 } };

export const ReadOnly: Story = { args: { isReadOnly: true, defaultValue: 3 } };

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState(4);
    return (
      <div className="flex flex-col gap-3 font-sans text-sm text-text">
        <NumberField {...args} defaultValue={undefined} value={value} onChange={setValue} />
        <p className="text-muted">
          Value: <span className="font-mono text-text">{value}</span>
        </p>
      </div>
    );
  },
};
