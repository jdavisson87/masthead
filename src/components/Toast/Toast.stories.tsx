import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Toaster, toast, type ToastTone } from './Toast';

type DemoArgs = {
  title: string;
  description: string;
  tone: ToastTone;
  withAction: boolean;
  timeout: number;
};

const show = ({ title, description, tone, withAction, timeout }: DemoArgs) => {
  const fn = { neutral: toast.show, accent: toast.info, success: toast.success, danger: toast.error }[tone];
  fn(title, {
    description: description || undefined,
    timeout,
    action: withAction ? { label: 'Undo', onPress: () => toast.show('Undone') } : undefined,
  });
};

const meta: Meta<DemoArgs> = {
  title: 'Components/Toast',
  tags: ['autodocs'],
  // Each story renders its own <Toaster />, so show them in isolated frames on the docs page.
  parameters: { layout: 'centered', docs: { story: { inline: false, iframeHeight: 360 } } },
  args: {
    title: 'Changes saved',
    description: 'Your project is up to date.',
    tone: 'success',
    withAction: false,
    timeout: 5000,
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    tone: { control: 'inline-radio', options: ['neutral', 'accent', 'success', 'danger'] },
    withAction: { control: 'boolean', description: 'Adds an "Undo" action button' },
    timeout: { control: { type: 'number', min: 0, step: 1000 }, description: 'ms before auto-dismiss; 0 keeps it open' },
  },
};

export default meta;
type Story = StoryObj<DemoArgs>;

export const Default: Story = {
  render: (args) => (
    <>
      <Button onPress={() => show(args)}>Show toast</Button>
      <Toaster />
    </>
  ),
};

export const WithAction: Story = {
  args: { title: 'Item deleted', description: '', tone: 'neutral', withAction: true, timeout: 10000 },
  render: (args) => (
    <>
      <Button intent="secondary" onPress={() => show(args)}>
        Delete item
      </Button>
      <Toaster />
    </>
  ),
};

export const AllTones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      <div className="flex flex-wrap gap-2">
        <Button intent="secondary" onPress={() => toast.show('Draft saved')}>
          Neutral
        </Button>
        <Button intent="secondary" onPress={() => toast.info('New version available')}>
          Info
        </Button>
        <Button intent="secondary" onPress={() => toast.success('Message sent')}>
          Success
        </Button>
        <Button intent="secondary" onPress={() => toast.error('Upload failed', { description: 'Check your connection and try again.' })}>
          Error
        </Button>
      </div>
      <Toaster />
    </>
  ),
};
