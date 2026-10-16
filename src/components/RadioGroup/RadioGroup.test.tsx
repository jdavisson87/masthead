import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Radio, RadioGroup, type RadioGroupProps } from './RadioGroup';

function Example(props: Partial<RadioGroupProps>) {
  return (
    <RadioGroup label="Billing plan" {...props}>
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team">Team</Radio>
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('is a named radiogroup containing the options', () => {
    render(<Example />);
    expect(screen.getByRole('radiogroup', { name: 'Billing plan' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Pro' })).not.toBeChecked();
  });

  it('selects an option on click and reports its value', async () => {
    const onChange = vi.fn();
    render(<Example onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('pro');

    await userEvent.click(screen.getByRole('radio', { name: 'Team' }));
    expect(screen.getByRole('radio', { name: 'Pro' })).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('team');
  });

  it('honors defaultValue', () => {
    render(<Example defaultValue="pro" />);
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
  });

  it('works as a controlled input', async () => {
    function Controlled() {
      const [value, setValue] = useState('free');
      return <Example value={value} onChange={setValue} />;
    }
    render(<Controlled />);
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Team' }));
    expect(screen.getByRole('radio', { name: 'Team' })).toBeChecked();
  });

  it('is one tab stop, and arrow keys move the selection', async () => {
    render(
      <>
        <button>before</button>
        <Example defaultValue="free" />
        <button>after</button>
      </>,
    );
    await userEvent.tab(); // before
    await userEvent.tab(); // the selected radio
    expect(screen.getByRole('radio', { name: 'Free' })).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Pro' })).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}{ArrowUp}'); // wraps to the last option
    expect(screen.getByRole('radio', { name: 'Team' })).toBeChecked();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
  });

  it('skips disabled options when moving with arrow keys', async () => {
    render(
      <RadioGroup label="Plan" defaultValue="free">
        <Radio value="free">Free</Radio>
        <Radio value="pro" isDisabled>
          Pro
        </Radio>
        <Radio value="team">Team</Radio>
      </RadioGroup>,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Team' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeDisabled();
  });

  it('disables every option with isDisabled', async () => {
    const onChange = vi.fn();
    render(<Example isDisabled onChange={onChange} />);
    screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
    await userEvent.click(screen.getByText('Pro'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('links group description and option descriptions', () => {
    render(
      <RadioGroup label="Frequency" description="Change this any time.">
        <Radio value="daily" description="One summary each morning.">
          Daily
        </Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription('Change this any time.');
    // An option's description also includes the group's, so match on what is specific to the option.
    expect(screen.getByRole('radio', { name: 'Daily' })).toHaveAccessibleDescription(
      expect.stringContaining('One summary each morning.'),
    );
  });

  it('shows the error message when invalid', () => {
    render(<Example isInvalid errorMessage="Choose a plan to continue." />);
    expect(screen.getByText('Choose a plan to continue.')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription('Choose a plan to continue.');
  });

  it('submits the selected value with a form', async () => {
    render(
      <form aria-label="plan form">
        <Example name="plan" />
      </form>,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Pro' }));
    const form = screen.getByRole('form', { name: 'plan form' }) as HTMLFormElement;
    expect(new FormData(form).get('plan')).toBe('pro');
  });

  it.each([
    ['default', {}],
    ['selected', { defaultValue: 'pro' }],
    ['horizontal', { orientation: 'horizontal' as const }],
    ['described', { description: 'Pick one.' }],
    ['invalid', { isInvalid: true, errorMessage: 'Required.' }],
    ['disabled', { isDisabled: true }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(<Example {...props} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
