import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardContent, CardHeader } from '../Card/Card';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: { shape: 'text', className: 'w-64' },
  argTypes: { shape: { control: 'inline-radio', options: ['text', 'block'] } },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};
export const Block: Story = { args: { shape: 'block' } };

/** Mark the loading region with aria-busy and give screen readers a status message. */
export const LoadingCard: Story = {
  render: () => (
    <Card className="w-80" aria-busy="true">
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton />
        <Skeleton />
        <Skeleton className="w-3/4" />
        <span role="status" className="sr-only">
          Loading
        </span>
      </CardContent>
    </Card>
  ),
};
