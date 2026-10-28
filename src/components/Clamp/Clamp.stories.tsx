import type { Meta, StoryObj } from '@storybook/react-vite';
import { Clamp } from './Clamp';

const long =
  'The vote followed three hours of public comment, with most speakers urging more frequent weekend service. Supporters said the plan restores routes cut during the pandemic, while opponents questioned how the agency would pay for it once federal relief runs out. Several members asked staff to return in the spring with ridership numbers, and one proposed a sunset clause that would end the added routes if they fail to meet targets. The budget takes effect in January.';

const meta = {
  title: 'Editorial/Clamp',
  component: Clamp,
  args: { children: long, lines: 3 },
  argTypes: { lines: { control: { type: 'number', min: 1, max: 8 } } },
  decorators: [(Story) => <div className="max-w-md p-xl text-body-md text-text"><Story /></div>],
} satisfies Meta<typeof Clamp>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TwoLines: Story = { args: { lines: 2 } };
export const StartsExpanded: Story = { args: { defaultExpanded: true } };
export const ShortTextHasNoToggle: Story = { args: { children: 'A short summary that fits.' } };
export const CustomLabels: Story = { args: { moreLabel: 'Continue reading', lessLabel: 'Collapse' } };
