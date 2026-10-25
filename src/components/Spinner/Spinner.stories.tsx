import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../Card/Card';
import { Spinner } from './Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['accent', 'muted', 'current'] },
    showLabel: { control: 'boolean' },
    decorative: { control: 'boolean' },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = { args: { label: 'Loading orders', showLabel: true } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Spinner key={size} {...args} size={size} label={`Loading (${size})`} />
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <div className="flex items-center gap-6 text-text">
      <Spinner {...args} tone="accent" label="Accent" />
      <Spinner {...args} tone="muted" label="Muted" />
      <Spinner {...args} tone="current" label="Current color" />
    </div>
  ),
};

/** The button's text already says "Saving…", so the spinner is decorative and not announced twice. */
export const InsideButton: Story = {
  render: () => {
    const [saving, setSaving] = useState(false);
    useEffect(() => {
      if (!saving) return;
      const id = setTimeout(() => setSaving(false), 2000);
      return () => clearTimeout(id);
    }, [saving]);
    return (
      <Button isDisabled={saving} onPress={() => setSaving(true)}>
        {saving && <Spinner decorative size="sm" tone="current" />}
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
    );
  },
};

/** A loading region: the container is marked busy and a labelled spinner tells people what is loading. */
export const LoadingRegion: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <Card className="w-96" aria-busy="true">
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <Spinner label="Loading recent orders" showLabel />
      </CardContent>
    </Card>
  ),
};
