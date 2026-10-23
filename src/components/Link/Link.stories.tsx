import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Link, RouterProvider } from './Link';

const meta = {
  title: 'Components/Link',
  component: Link,
  tags: ['autodocs'],
  args: { children: 'Read the docs', href: '#docs' },
  argTypes: {
    intent: { control: 'inline-radio', options: ['inline', 'subtle'] },
    isDisabled: { control: 'boolean' },
    target: { control: 'inline-radio', options: [undefined, '_blank'] },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InsideText: Story = {
  render: (args) => (
    <p className="max-w-md font-sans text-base leading-relaxed text-text">
      Masthead is built on React Aria, so every control is keyboard accessible. See the <Link {...args}>component guide</Link> for the
      full list, or browse the <Link {...args} href="#tokens">design tokens</Link>.
    </p>
  ),
};

export const Subtle: Story = {
  args: { intent: 'subtle' },
  render: (args) => (
    <nav aria-label="Footer" className="flex gap-6 font-sans text-sm">
      <Link {...args} href="#about">About</Link>
      <Link {...args} href="#changelog">Changelog</Link>
      <Link {...args} href="#license">License</Link>
    </nav>
  ),
};

export const External: Story = {
  args: { children: 'React Aria documentation', href: 'https://react-spectrum.adobe.com/react-aria/', target: '_blank' },
};

export const Disabled: Story = { args: { isDisabled: true } };

export const CurrentPage: Story = {
  render: (args) => (
    <nav aria-label="Primary" className="flex gap-6 font-sans text-sm">
      <Link {...args} intent="subtle" href="#home" aria-current="page">Home</Link>
      <Link {...args} intent="subtle" href="#components">Components</Link>
      <Link {...args} intent="subtle" href="#tokens">Tokens</Link>
    </nav>
  ),
};

/** Without `href` a Link is an accessible action: role="link", focusable, fires onPress. */
export const AsAction: Story = {
  args: { href: undefined, children: 'Show all 24 comments' },
  render: (args) => {
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="font-sans text-sm text-text">
        <Link {...args} onPress={() => setExpanded((v) => !v)}>
          {expanded ? 'Hide comments' : args.children}
        </Link>
        {expanded && <p className="mt-2 text-muted">Comments would render here.</p>}
      </div>
    );
  },
};

/** Wrap the app once; every Link then navigates through your router. Here a fake router just records the path. */
export const ClientSideRouting: Story = {
  render: (args) => {
    const [path, setPath] = useState('/');
    return (
      <RouterProvider navigate={setPath}>
        <div className="flex flex-col gap-3 font-sans text-sm text-text">
          <nav aria-label="Demo" className="flex gap-6">
            <Link {...args} href="/dashboard">Dashboard</Link>
            <Link {...args} href="/settings">Settings</Link>
          </nav>
          <p className="text-muted">
            Router path: <span className="font-mono text-text">{path}</span> (no page reload)
          </p>
        </div>
      </RouterProvider>
    );
  },
};
