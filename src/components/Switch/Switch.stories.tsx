import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { children: 'Email notifications' },
  argTypes: { isDisabled: { control: 'boolean' } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { defaultSelected: true } };
export const Disabled: Story = { args: { isDisabled: true } };
export const DisabledOn: Story = { args: { isDisabled: true, defaultSelected: true } };

export const Settings: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch defaultSelected>Email notifications</Switch>
      <Switch>Push notifications</Switch>
      <Switch isDisabled>Weekly digest (managed by your admin)</Switch>
    </div>
  ),
};
