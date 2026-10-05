import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from './TextField';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  tags: ['autodocs'],
  args: { label: 'Email', placeholder: 'you@example.com', className: 'w-72' },
  argTypes: {
    isDisabled: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    isRequired: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { description: "We'll only use this to send receipts." },
};

export const Required: Story = {
  args: { isRequired: true, description: 'Required field.' },
};

export const Invalid: Story = {
  args: { isInvalid: true, defaultValue: 'not-an-email', errorMessage: 'Enter a valid email address.' },
};

/** Validates as the user types. `validationBehavior="aria"` runs `validate` in real time. */
export const LiveValidation: Story = {
  args: {
    label: 'Username',
    placeholder: 'at least 3 characters',
    validationBehavior: 'aria',
    validate: (value: string) => (value.length > 0 && value.length < 3 ? 'Use at least 3 characters.' : null),
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'locked@example.com' },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: 'read-only value' },
};

export const Password: Story = {
  args: { label: 'Password', type: 'password', placeholder: '' },
};
