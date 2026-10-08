import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../Card/Card';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    keyboardActivation: {
      control: 'inline-radio',
      options: ['automatic', 'manual'],
      description: 'automatic: arrow keys select; manual: arrow keys move focus, Enter or Space selects',
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs {...args} className="max-w-xl">
      <TabList aria-label="Project sections">
        <Tab id="overview">Overview</Tab>
        <Tab id="activity">Activity</Tab>
        <Tab id="settings">Settings</Tab>
      </TabList>
      <TabPanel id="overview">A summary of the project: goals, owners, and the current status.</TabPanel>
      <TabPanel id="activity">Recent commits, deploys, and comments appear here.</TabPanel>
      <TabPanel id="settings">Name, visibility, and danger-zone controls live here.</TabPanel>
    </Tabs>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <Tabs {...args} className="max-w-xl">
      <TabList aria-label="Account sections">
        <Tab id="profile">Profile</Tab>
        <Tab id="security">Security</Tab>
        <Tab id="notifications">Notifications</Tab>
      </TabList>
      <TabPanel id="profile">Update your name, photo, and contact details.</TabPanel>
      <TabPanel id="security">Change your password and manage two-factor authentication.</TabPanel>
      <TabPanel id="notifications">Choose which emails and alerts you receive.</TabPanel>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  args: { disabledKeys: ['billing'] },
  render: (args) => (
    <Tabs {...args} className="max-w-xl">
      <TabList aria-label="Workspace sections">
        <Tab id="members">Members</Tab>
        <Tab id="billing">Billing</Tab>
        <Tab id="integrations">Integrations</Tab>
      </TabList>
      <TabPanel id="members">Invite and manage teammates.</TabPanel>
      <TabPanel id="billing">Not available on your plan.</TabPanel>
      <TabPanel id="integrations">Connect the tools your team already uses.</TabPanel>
    </Tabs>
  ),
};

/** Tabs compose with the rest of the system: a Badge in a label, a Card in a panel. */
export const WithBadgeAndCard: Story = {
  render: (args) => (
    <Tabs {...args} className="max-w-xl">
      <TabList aria-label="Inbox">
        <Tab id="all">All</Tab>
        <Tab id="unread">
          <span className="inline-flex items-center gap-2">
            Unread <Badge tone="accent">3</Badge>
          </span>
        </Tab>
      </TabList>
      <TabPanel id="all">
        <Card>
          <CardHeader>
            <CardTitle>All messages</CardTitle>
            <CardDescription>24 messages in total.</CardDescription>
          </CardHeader>
          <CardContent>Everything you've received this month.</CardContent>
        </Card>
      </TabPanel>
      <TabPanel id="unread">
        <Card>
          <CardHeader>
            <CardTitle>Unread</CardTitle>
            <CardDescription>3 messages need attention.</CardDescription>
          </CardHeader>
          <CardContent>Start with the oldest first.</CardContent>
        </Card>
      </TabPanel>
    </Tabs>
  ),
};
