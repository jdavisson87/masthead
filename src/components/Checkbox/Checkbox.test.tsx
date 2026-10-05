import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('has an accessible name from its label', () => {
    render(<Checkbox>Accept terms</Checkbox>);
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
  });

  it('toggles on click and reports the change', async () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>Accept terms</Checkbox>);
    const box = screen.getByRole('checkbox', { name: 'Accept terms' });
    await userEvent.click(box);
    expect(box).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(box);
    expect(box).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('toggles with the Space key', async () => {
    render(<Checkbox>Accept terms</Checkbox>);
    const box = screen.getByRole('checkbox', { name: 'Accept terms' });
    await userEvent.tab();
    expect(box).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(box).toBeChecked();
  });

  it('works as a controlled input', async () => {
    function Controlled() {
      const [selected, setSelected] = useState(false);
      return (
        <Checkbox isSelected={selected} onChange={setSelected}>
          Subscribe
        </Checkbox>
      );
    }
    render(<Controlled />);
    const box = screen.getByRole('checkbox', { name: 'Subscribe' });
    await userEvent.click(box);
    expect(box).toBeChecked();
  });

  it('exposes the indeterminate state', () => {
    render(<Checkbox isIndeterminate>Select all</Checkbox>);
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toBePartiallyChecked();
  });

  it('does not change when disabled', async () => {
    const onChange = vi.fn();
    render(
      <Checkbox isDisabled onChange={onChange}>
        Accept terms
      </Checkbox>,
    );
    const box = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(box).toBeDisabled();
    await userEvent.click(box);
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([
    ['default', {}],
    ['checked', { defaultSelected: true }],
    ['indeterminate', { isIndeterminate: true }],
    ['invalid', { isInvalid: true }],
    ['disabled', { isDisabled: true }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(<Checkbox {...props}>Accept terms</Checkbox>);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
