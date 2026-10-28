import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd, useKeyboardShortcut } from './Kbd';

const meta = {
  title: 'Editorial/Keyboard Shortcut',
  component: Kbd,
  args: { keys: ['mod', 'K'], size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    platform: { control: 'inline-radio', options: [undefined, 'mac', 'other'] },
  },
} satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mac: Story = { args: { platform: 'mac' } };
export const Windows: Story = { args: { platform: 'other' } };
export const Combination: Story = { args: { keys: ['shift', 'alt', 'enter'] } };
export const InText: Story = {
  render: () => (
    <p className="m-0 text-body-md text-text">
      Press <Kbd keys={['mod', 'K']} size="sm" /> to open search, or <Kbd keys={['esc']} size="sm" /> to close it.
    </p>
  ),
};

export const BoundShortcut: Story = {
  render: function Render() {
    const [count, setCount] = useState(0);
    useKeyboardShortcut(['mod', 'J'], () => setCount((c) => c + 1));
    return (
      <p className="m-0 text-body-md text-text">
        Press <Kbd keys={['mod', 'J']} size="sm" /> anywhere. Pressed {count} times.
      </p>
    );
  },
};
