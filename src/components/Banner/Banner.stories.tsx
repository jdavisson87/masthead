import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner } from './Banner';
import { Link } from '../Link/Link';

const meta = {
  title: 'Editorial/Breaking Banner',
  component: Banner,
  args: { children: 'Council approves the transit budget after a late-night vote.', severity: 'info' },
  argTypes: { severity: { control: 'inline-radio', options: ['info', 'success', 'critical'] } },
} satisfies Meta<typeof Banner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};
export const Success: Story = { args: { severity: 'success', children: 'Service has been restored on all lines.' } };
export const Breaking: Story = {
  args: {
    severity: 'critical',
    children: 'Downtown road closures in effect until 6 p.m. after a water main break.',
    action: <Link href="#live" intent="subtle">Follow live updates</Link>,
  },
};
export const Dismissible: Story = { args: { onDismiss: () => {} } };
export const CustomLabel: Story = { args: { label: 'Correction', children: 'An earlier version misstated the vote count.' } };
