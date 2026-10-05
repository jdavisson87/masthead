import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { children: 'Accept the terms and conditions' },
  argTypes: {
    isDisabled: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    isIndeterminate: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultSelected: true } };
export const Indeterminate: Story = { args: { isIndeterminate: true, children: 'Select all' } };
export const Invalid: Story = { args: { isInvalid: true } };
export const Disabled: Story = { args: { isDisabled: true } };
export const DisabledChecked: Story = { args: { isDisabled: true, defaultSelected: true } };

export const List: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox defaultSelected>Email me product updates</Checkbox>
      <Checkbox>Email me a weekly digest</Checkbox>
      <Checkbox isDisabled>Share usage data (managed by your admin)</Checkbox>
    </div>
  ),
};
