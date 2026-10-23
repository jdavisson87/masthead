import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from './TextArea';

const meta = {
  title: 'Components/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  args: { label: 'Bio', placeholder: 'Tell us a little about yourself', className: 'w-96' },
  argTypes: {
    rows: { control: { type: 'number', min: 1, max: 12 } },
    resize: { control: 'inline-radio', options: ['none', 'vertical'] },
    autoGrow: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    isRequired: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { description: 'Shown on your public profile.' },
};

export const CharacterCount: Story = {
  args: { maxLength: 140, defaultValue: 'Front-end engineer who likes sharp edges.', description: 'Keep it short.' },
};

export const AutoGrow: Story = {
  args: { autoGrow: true, rows: 2, description: 'Grows with your text, up to a limit.' },
};

export const NoResize: Story = { args: { resize: 'none' } };

export const Required: Story = { args: { isRequired: true, description: 'Required field.' } };

export const Invalid: Story = {
  args: { isInvalid: true, defaultValue: 'Hi', errorMessage: 'Write at least 20 characters.' },
};

export const Disabled: Story = { args: { isDisabled: true, defaultValue: 'This field is disabled.' } };

export const ReadOnly: Story = { args: { isReadOnly: true, defaultValue: 'You can select this text but not edit it.' } };
