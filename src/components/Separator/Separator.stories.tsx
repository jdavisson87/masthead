import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Separator } from './Separator';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    tone: { control: 'inline-radio', options: ['subtle', 'strong', 'ink'] },
    weight: { control: 'inline-radio', options: ['thin', 'thick'] },
    decorative: { control: 'boolean' },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-md font-sans text-sm text-text">
      <p>Release notes for version 2.4: new components, fixes and a refreshed dark theme.</p>
      <div className="my-4">
        <Separator {...args} />
      </div>
      <p>Migration guide: what changed and how to update.</p>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical', decorative: true },
  render: (args) => (
    <div className="flex h-8 items-center gap-3 font-sans">
      <Button intent="ghost" size="sm">Bold</Button>
      <Button intent="ghost" size="sm">Italic</Button>
      <Separator {...args} className="h-5 self-auto" />
      <Button intent="ghost" size="sm">Link</Button>
      <Button intent="ghost" size="sm">Code</Button>
    </div>
  ),
};

/** The editorial masthead rule: a heavy ink line over a hairline. */
export const MastheadRule: Story = {
  render: () => (
    <header className="max-w-lg font-sans text-text">
      <h2 className="font-serif text-4xl font-medium tracking-tight">The Masthead Review</h2>
      <div className="mt-3 flex flex-col gap-0.5">
        <Separator tone="ink" weight="thick" />
        <Separator tone="ink" />
      </div>
      <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted">Vol. 4 · Autumn edition</p>
    </header>
  ),
};

export const TonesAndWeights: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6 font-mono text-xs uppercase tracking-wider text-muted">
      {(['subtle', 'strong', 'ink'] as const).map((tone) => (
        <div key={tone} className="flex flex-col gap-3">
          <span>{tone}</span>
          <Separator tone={tone} />
          <Separator tone={tone} weight="thick" />
        </div>
      ))}
    </div>
  ),
};

export const BetweenListItems: Story = {
  render: () => (
    <ul className="max-w-xs font-sans text-sm text-text">
      {['Profile', 'Notifications', 'Billing'].map((item, i) => (
        <li key={item}>
          {i > 0 && <Separator />}
          <div className="py-3">{item}</div>
        </li>
      ))}
    </ul>
  ),
};
