import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Type and spacing',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Class names are written out in full so Tailwind can detect them.
const headings = [
  { name: 'heading-xs', cls: 'text-heading-xs', size: '1rem' },
  { name: 'heading-sm', cls: 'text-heading-sm', size: '1.25rem' },
  { name: 'heading-md', cls: 'text-heading-md', size: '1.5rem' },
  { name: 'heading-lg', cls: 'text-heading-lg', size: 'fluid 1.75 to 2.25rem' },
  { name: 'heading-xl', cls: 'text-heading-xl', size: 'fluid 2.25 to 3.5rem' },
];
const bodies = [
  { name: 'body-xs', cls: 'text-body-xs', size: '0.75rem' },
  { name: 'body-sm', cls: 'text-body-sm', size: '0.875rem' },
  { name: 'body-md', cls: 'text-body-md', size: '1rem' },
  { name: 'body-lg', cls: 'text-body-lg', size: '1.125rem' },
  { name: 'body-xl', cls: 'text-body-xl', size: '1.25rem' },
];
const spaces = [
  { name: 'xs', size: '4px', cls: 'w-xs' },
  { name: 'sm', size: '8px', cls: 'w-sm' },
  { name: 'md', size: '16px', cls: 'w-md' },
  { name: 'lg', size: '24px', cls: 'w-lg' },
  { name: 'xl', size: '40px', cls: 'w-xl' },
];

export const Typography: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-xl bg-bg p-lg text-text">
      <section className="flex flex-col gap-md">
        <h2 className="font-mono text-body-xs uppercase tracking-wider text-muted">Headings (Newsreader)</h2>
        {headings.map((h) => (
          <div key={h.name} className="flex flex-col gap-xs border-b border-border pb-md">
            <p className="font-mono text-body-xs text-muted">
              {h.name} · {h.size}
            </p>
            <p className={`font-serif font-semibold ${h.cls}`}>Council approves the new transit budget</p>
          </div>
        ))}
      </section>
      <section className="flex flex-col gap-md">
        <h2 className="font-mono text-body-xs uppercase tracking-wider text-muted">Body (Inter)</h2>
        {bodies.map((b) => (
          <div key={b.name} className="flex flex-col gap-xs border-b border-border pb-md">
            <p className="font-mono text-body-xs text-muted">
              {b.name} · {b.size}
            </p>
            <p className={`font-sans ${b.cls}`}>
              The vote followed three hours of public comment, with most speakers urging more frequent weekend service.
            </p>
          </div>
        ))}
      </section>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-md bg-bg p-lg text-text">
      {spaces.map((s) => (
        <div key={s.name} className="flex items-center gap-md">
          <p className="w-24 font-mono text-body-xs text-muted">
            {s.name} · {s.size}
          </p>
          <div className={`h-md bg-accent ${s.cls}`} />
        </div>
      ))}
    </div>
  ),
};
