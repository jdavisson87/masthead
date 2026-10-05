import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Weekly digest</CardTitle>
        <CardDescription>Sent every Monday morning.</CardDescription>
      </CardHeader>
      <CardContent>A short summary of what changed in your projects over the past week.</CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Delete project</CardTitle>
        <CardDescription>This action can't be undone.</CardDescription>
      </CardHeader>
      <CardContent>All files and history for this project will be permanently removed.</CardContent>
      <CardFooter>
        <Button intent="ghost">Cancel</Button>
        <Button intent="danger">Delete</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Deploy #214</CardTitle>
          <Badge tone="success">Live</Badge>
        </div>
        <CardDescription>main · 3 minutes ago</CardDescription>
      </CardHeader>
      <CardContent>Build passed. All checks green.</CardContent>
    </Card>
  ),
};

export const StatGrid: Story = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
      {[
        { label: 'Revenue', value: '$12,400' },
        { label: 'Orders', value: '318' },
        { label: 'Refunds', value: '4' },
      ].map((s) => (
        <Card key={s.label}>
          <CardContent>
            <p className="font-mono text-xs uppercase tracking-wider text-muted">{s.label}</p>
            <p className="mt-1 font-serif text-3xl font-medium">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
