import type { Meta, StoryObj } from '@storybook/react-vite';
import { Byline } from './Byline';

const meta = {
  title: 'Editorial/Byline',
  component: Byline,
  args: {
    authors: [{ name: 'Ada Lovelace', href: '#ada' }],
    publication: 'Masthead Wire',
    date: '2026-10-26',
    readingMinutes: 6,
  },
} satisfies Meta<typeof Byline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAvatars: Story = { args: { showAvatars: true } };
export const TwoAuthors: Story = {
  args: { authors: [{ name: 'Ada Lovelace', href: '#ada' }, { name: 'Grace Hopper', href: '#grace' }], showAvatars: true },
};
export const ThreeAuthors: Story = {
  args: { authors: [{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }, { name: 'Alan Turing' }], showAvatars: true },
};
export const DateOnly: Story = { args: { authors: [], publication: undefined, readingMinutes: undefined } };
export const French: Story = { args: { locale: 'fr-FR' } };
