import type { Meta, StoryObj } from '@storybook/react-vite';
import { DropCap } from './DropCap';

const body =
  'The vote followed three hours of public comment, with most speakers urging more frequent weekend service. Supporters said the plan restores routes cut during the pandemic, while opponents questioned how the agency would pay for it once federal relief runs out.';

const meta = {
  title: 'Editorial/Drop Cap',
  component: DropCap,
  args: { children: body, lines: 3 },
  argTypes: { lines: { control: 'inline-radio', options: [2, 3, 4] } },
  decorators: [(Story) => <div className="max-w-prose p-xl"><Story /></div>],
} satisfies Meta<typeof DropCap>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TwoLines: Story = { args: { lines: 2 } };
export const FourLines: Story = { args: { lines: 4 } };
