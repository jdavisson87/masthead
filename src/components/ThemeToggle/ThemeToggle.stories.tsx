import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeToggle } from './ThemeToggle';

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  // The toggle owns the theme in these stories; stop the toolbar Theme global from overriding it.
  parameters: { manageTheme: true },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    showLabels: { control: 'boolean' },
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabels: Story = { args: { showLabels: true } };

export const Small: Story = { args: { size: 'sm', showLabels: true } };
