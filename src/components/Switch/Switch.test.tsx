import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Switch } from './Switch';

describe('Switch', () => {
  it('exposes the switch role with its label as the name', () => {
    render(<Switch>Notifications</Switch>);
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('toggles on click and reports the change', async () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange}>Notifications</Switch>);
    const toggle = screen.getByRole('switch', { name: 'Notifications' });
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('toggles with the Space key', async () => {
    render(<Switch>Notifications</Switch>);
    const toggle = screen.getByRole('switch', { name: 'Notifications' });
    await userEvent.tab();
    expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(toggle).toBeChecked();
  });

  it('works as a controlled input', async () => {
    function Controlled() {
      const [on, setOn] = useState(false);
      return (
        <Switch isSelected={on} onChange={setOn}>
          Dark mode
        </Switch>
      );
    }
    render(<Controlled />);
    const toggle = screen.getByRole('switch', { name: 'Dark mode' });
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('does not change when disabled', async () => {
    const onChange = vi.fn();
    render(
      <Switch isDisabled onChange={onChange}>
        Notifications
      </Switch>,
    );
    const toggle = screen.getByRole('switch', { name: 'Notifications' });
    expect(toggle).toBeDisabled();
    await userEvent.click(toggle);
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([
    ['off', {}],
    ['on', { defaultSelected: true }],
    ['disabled', { isDisabled: true }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(<Switch {...props}>Notifications</Switch>);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
