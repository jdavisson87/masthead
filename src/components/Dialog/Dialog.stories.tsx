import type { ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { TextField } from '../TextField/TextField';
import { Dialog, DialogFooter, DialogTrigger, type DialogProps } from './Dialog';

/** Story-only controls so the text can be edited in Storybook. */
type DemoArgs = Omit<DialogProps, 'children'> & { triggerLabel: string; body: string };

const meta: Meta<DemoArgs> = {
  title: 'Components/Dialog',
  // Stories always supply `children` in render(), so the demo args omit it; cast for Storybook's types.
  component: Dialog as unknown as ComponentType<DemoArgs>,
  tags: ['autodocs'],
  parameters: { controls: { include: ['triggerLabel', 'title', 'description', 'body', 'size', 'isDismissable', 'showCloseButton'] } },
  args: {
    triggerLabel: 'Open dialog',
    title: 'Publish changes',
    description: 'Your changes will be visible to everyone on the team.',
    body: 'You can unpublish at any time from the project settings.',
    size: 'md',
  },
  argTypes: {
    triggerLabel: { control: 'text', description: 'Story only: trigger button text' },
    body: { control: 'text', description: 'Story only: dialog body text' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<DemoArgs>;

export const Default: Story = {
  args: {
    showCloseButton: false
  },

  render: ({ triggerLabel, body, ...dialogProps }) => (
    <DialogTrigger>
      <Button>{triggerLabel}</Button>
      <Dialog {...dialogProps}>
        {({ close }) => (
          <>
            <p className="text-sm">{body}</p>
            <DialogFooter>
              <Button intent="ghost" onPress={close}>
                Cancel
              </Button>
              <Button onPress={close}>Publish</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  )
};

/** Destructive confirmations use `role="alertdialog"`: no close button, no outside-click dismiss. */
export const ConfirmDestructive: Story = {
  args: {
    triggerLabel: 'Delete project',
    title: 'Delete this project?',
    description: "All files and history will be permanently removed. This can't be undone.",
    role: 'alertdialog',
    size: 'sm',
  },
  parameters: { controls: { include: ['triggerLabel', 'title', 'description', 'size'] } },
  render: ({ triggerLabel, body: _body, ...dialogProps }) => (
    <DialogTrigger>
      <Button intent="danger">{triggerLabel}</Button>
      <Dialog {...dialogProps}>
        {({ close }) => (
          <DialogFooter>
            <Button intent="ghost" onPress={close}>
              Cancel
            </Button>
            <Button intent="primary" onPress={close}>
              Delete
            </Button>
          </DialogFooter>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};

export const WithForm: Story = {
  args: { triggerLabel: 'Invite teammate', title: 'Invite a teammate', description: "We'll email them a link to join.", size: 'md' },
  parameters: { controls: { include: ['triggerLabel', 'title', 'description', 'size'] } },
  render: ({ triggerLabel, body: _body, ...dialogProps }) => (
    <DialogTrigger>
      <Button>{triggerLabel}</Button>
      <Dialog {...dialogProps}>
        {({ close }) => (
          <>
            <TextField label="Email" type="email" placeholder="teammate@example.com" autoFocus />
            <DialogFooter>
              <Button intent="ghost" onPress={close}>
                Cancel
              </Button>
              <Button onPress={close}>Send invite</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
};
