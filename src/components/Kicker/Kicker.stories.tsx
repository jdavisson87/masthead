import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kicker } from './Kicker';

const meta = {
  title: 'Editorial/Kicker',
  component: Kicker,
  args: { children: 'Politics', tone: 'accent' },
  argTypes: { tone: { control: 'inline-radio', options: ['accent', 'muted'] } },
} satisfies Meta<typeof Kicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Muted: Story = { args: { tone: 'muted', children: 'Opinion' } };
export const AboveHeadline: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-xs">
      <Kicker>Transit</Kicker>
      <h2 className="m-0 font-serif text-heading-lg font-semibold text-text">Council approves the new transit budget</h2>
    </div>
  ),
};
