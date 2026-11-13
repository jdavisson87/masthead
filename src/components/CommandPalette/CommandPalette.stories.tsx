import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Key } from 'react-aria-components';
import { Button } from '../Button/Button';
import { Kbd } from '../Kbd/Kbd';
import { CommandItem, CommandPalette, CommandSection } from './CommandPalette';

const icon = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 } as const;
const icons = {
  home: (
    <svg {...icon}>
      <path d="M2.5 7.5L8 3l5.5 4.5V13h-11z" />
    </svg>
  ),
  chart: (
    <svg {...icon}>
      <path d="M3 13V8M8 13V3M13 13v-6" />
    </svg>
  ),
  gear: (
    <svg {...icon}>
      <circle cx="8" cy="8" r="2.25" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </svg>
  ),
  moon: (
    <svg {...icon}>
      <path d="M12.5 10A5 5 0 016 3.5a5 5 0 106.5 6.5z" />
    </svg>
  ),
  plus: (
    <svg {...icon}>
      <path d="M8 3v10M3 8h10" />
    </svg>
  ),
  link: (
    <svg {...icon}>
      <path d="M7 9a3 3 0 004.2 0l2-2a3 3 0 00-4.2-4.2l-.6.6M9 7a3 3 0 00-4.2 0l-2 2a3 3 0 004.2 4.2l.6-.6" />
    </svg>
  ),
};

function Commands() {
  return (
    <>
      <CommandSection title="Go to">
        <CommandItem id="dashboard" icon={icons.home} shortcut={['mod', 'shift', 'D']}>
          Dashboard
        </CommandItem>
        <CommandItem id="reports" icon={icons.chart} description="Weekly and monthly summaries">
          Reports
        </CommandItem>
        <CommandItem id="settings" icon={icons.gear} keywords={['preferences', 'account', 'profile']}>
          Settings
        </CommandItem>
      </CommandSection>
      <CommandSection title="Actions">
        <CommandItem id="new-report" icon={icons.plus} shortcut={['mod', 'N']}>
          New report
        </CommandItem>
        <CommandItem id="copy-link" icon={icons.link} keywords={['share', 'url']}>
          Copy link to this page
        </CommandItem>
        <CommandItem id="export" isDisabled description="Available on the Team plan">
          Export as CSV
        </CommandItem>
      </CommandSection>
      <CommandSection title="Appearance">
        <CommandItem id="theme" icon={icons.moon} keywords={['dark', 'light', 'mode']}>
          Toggle theme
        </CommandItem>
      </CommandSection>
    </>
  );
}

const meta = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: null },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Press Cmd+K (Ctrl+K on Windows and Linux), or use the button. Try "dark" (a hidden keyword),
 * the arrow keys, Enter, and Escape. Focus returns to wherever it was.
 */
export const Default: Story = {
  render: function Render() {
    const [isOpen, setOpen] = useState(false);
    const [last, setLast] = useState<Key | null>(null);
    return (
      <div className="flex flex-col items-center gap-3 font-sans text-sm text-text">
        <Button intent="secondary" onPress={() => setOpen(true)}>
          Search commands <Kbd keys={['mod', 'K']} size="sm" className="ml-2" />
        </Button>
        <p className="m-0 text-muted">Last command: {last ?? 'none yet'}</p>
        <CommandPalette isOpen={isOpen} onOpenChange={setOpen} onAction={setLast}>
          <Commands />
        </CommandPalette>
      </div>
    );
  },
};

/** Opened from the start, without the keyboard hints row. */
export const OpenWithoutHints: Story = {
  render: () => (
    <CommandPalette defaultOpen showHints={false} shortcut={null}>
      <Commands />
    </CommandPalette>
  ),
};

/** A custom filter that matches only the start of a command's name. */
export const StartsWithFilter: Story = {
  render: () => (
    <div className="font-sans text-sm text-muted">
      Press <Kbd keys={['mod', 'K']} size="sm" /> and type “r”: Reports matches, Dashboard does not.
      <CommandPalette filter={(text, query) => text.toLowerCase().startsWith(query.toLowerCase())}>
        <Commands />
      </CommandPalette>
    </div>
  ),
};
