import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Class names are written out in full so Tailwind can detect them.
const swatches = [
  { name: 'bg', cls: 'bg-bg' },
  { name: 'surface', cls: 'bg-surface' },
  { name: 'raised', cls: 'bg-raised' },
  { name: 'border', cls: 'bg-border' },
  { name: 'border-strong', cls: 'bg-border-strong' },
  { name: 'text', cls: 'bg-text' },
  { name: 'muted', cls: 'bg-muted' },
  { name: 'accent', cls: 'bg-accent' },
  { name: 'accent-hover', cls: 'bg-accent-hover' },
  { name: 'danger', cls: 'bg-danger' },
  { name: 'success', cls: 'bg-success' },
];

export const Colors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {swatches.map((s) => (
        <div key={s.name} className="rounded-lg border border-border bg-surface p-3">
          <div className={`${s.cls} h-14 rounded-md border border-border`} />
          <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted">{s.name}</p>
        </div>
      ))}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="space-y-6 text-text">
      <p className="font-serif text-5xl font-medium tracking-tight">Display, Newsreader</p>
      <p className="font-serif text-4xl font-medium">Heading 1</p>
      <p className="font-serif text-3xl font-medium">Heading 2</p>
      <p className="font-serif text-2xl font-medium">Heading 3</p>
      <p className="font-sans text-base">Body copy in Inter. Hierarchy comes from size, weight, and whitespace.</p>
      <p className="font-sans text-sm font-medium">UI text, buttons and inputs</p>
      <p className="font-mono text-xs uppercase tracking-wider text-muted">Label, JetBrains Mono</p>
    </div>
  ),
};

export const Radii: Story = {
  render: () => (
    <div className="flex gap-6">
      {[
        { name: 'sm 2px', cls: 'rounded-sm' },
        { name: 'md 4px', cls: 'rounded-md' },
        { name: 'lg 6px', cls: 'rounded-lg' },
      ].map((r) => (
        <div key={r.name} className="text-center">
          <div className={`${r.cls} size-20 border border-border-strong bg-surface`} />
          <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted">{r.name}</p>
        </div>
      ))}
    </div>
  ),
};
