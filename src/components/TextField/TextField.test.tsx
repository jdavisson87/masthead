import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { TextField } from './TextField';

describe('TextField', () => {
  it('associates the label with the input', () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('reports typed text through onChange', async () => {
    const onChange = vi.fn();
    render(<TextField label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    expect(onChange).toHaveBeenLastCalledWith('Ada');
  });

  it('works as a controlled input', async () => {
    function Controlled() {
      const [value, setValue] = useState('');
      return <TextField label="Name" value={value} onChange={setValue} />;
    }
    render(<Controlled />);
    const input = screen.getByLabelText('Name');
    await userEvent.type(input, 'Grace');
    expect(input).toHaveValue('Grace');
  });

  it('links the description to the input', () => {
    render(<TextField label="Email" description="We never share it." />);
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('We never share it.');
  });

  it('shows the error message and marks the input invalid', () => {
    render(<TextField label="Email" isInvalid errorMessage="Enter a valid email." />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a valid email.')).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription(/Enter a valid email\./);
  });

  it('validates in real time with validationBehavior="aria"', async () => {
    render(
      <TextField
        label="Username"
        validationBehavior="aria"
        validate={(v) => (v.length < 3 ? 'Use at least 3 characters.' : null)}
      />,
    );
    await userEvent.type(screen.getByLabelText('Username'), 'ab');
    expect(screen.getByText('Use at least 3 characters.')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Username'), 'c');
    expect(screen.queryByText('Use at least 3 characters.')).not.toBeInTheDocument();
  });

  it('is not editable when disabled', async () => {
    render(<TextField label="Name" isDisabled />);
    const input = screen.getByLabelText('Name');
    expect(input).toBeDisabled();
    await userEvent.type(input, 'x');
    expect(input).toHaveValue('');
  });

  it.each([
    ['default', {}],
    ['with description', { description: 'Helper text' }],
    ['invalid', { isInvalid: true, errorMessage: 'Something is wrong.' }],
    ['disabled', { isDisabled: true }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(<TextField label="Email" {...props} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
