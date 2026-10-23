import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { NumberField, type NumberFieldProps } from './NumberField';


describe('NumberField', () => {
  it('has an accessible name and is announced as a number field', () => {
    render(<NumberField label="Quantity" defaultValue={3} />);
    // React Aria exposes it as a textbox described as a "Number field" (a text input so locale formats can be typed).
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    expect(input).toHaveValue('3');
    expect(input).toHaveAttribute('aria-roledescription', 'Number field');
    expect(input).toHaveAttribute('inputmode', 'numeric');
  });

  it('commits a typed value on blur', async () => {
    const onChange = vi.fn();
    render(<NumberField label="Quantity" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Quantity' }), '12');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(12);
  });

  it('steps with the arrow keys and respects the step size', async () => {
    render(<NumberField label="Quantity" defaultValue={10} step={5} />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue('15');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(input).toHaveValue('5');
  });

  it('jumps to the limits with Home and End', async () => {
    render(<NumberField label="Quantity" defaultValue={5} minValue={1} maxValue={9} />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    await userEvent.click(input);
    await userEvent.keyboard('{End}');
    expect(input).toHaveValue('9');
    await userEvent.keyboard('{Home}');
    expect(input).toHaveValue('1');
  });

  it('clamps typed values to the range', async () => {
    render(<NumberField label="Quantity" defaultValue={5} minValue={1} maxValue={10} />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    await userEvent.clear(input);
    await userEvent.type(input, '50');
    await userEvent.tab();
    expect(input).toHaveValue('10');
  });

  it('has stepper buttons that change the value', async () => {
    render(<NumberField label="Quantity" defaultValue={5} />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    await userEvent.click(screen.getByRole('button', { name: /increase/i }));
    expect(input).toHaveValue('6');
    await userEvent.click(screen.getByRole('button', { name: /decrease/i }));
    await userEvent.click(screen.getByRole('button', { name: /decrease/i }));
    expect(input).toHaveValue('4');
  });

  it('disables a stepper at its limit', () => {
    render(<NumberField label="Quantity" defaultValue={10} maxValue={10} />);
    expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /decrease/i })).toBeEnabled();
  });

  it('keeps the steppers out of the tab order', async () => {
    render(
      <>
        <button>before</button>
        <NumberField label="Quantity" defaultValue={1} />
        <button>after</button>
      </>,
    );
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('textbox', { name: 'Quantity' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
  });

  it('can hide the steppers', () => {
    render(<NumberField label="Quantity" defaultValue={1} hideSteppers />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('formats values, here as currency', () => {
    render(<NumberField label="Price" defaultValue={1234.5} formatOptions={{ style: 'currency', currency: 'USD' }} />);
    expect(screen.getByRole('textbox', { name: 'Price' })).toHaveValue('$1,234.50');
  });

  it('works as a controlled input', async () => {
    function Controlled() {
      const [value, setValue] = useState(2);
      return <NumberField label="Quantity" value={value} onChange={setValue} />;
    }
    render(<Controlled />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue('3');
  });

  it('links the description and shows the error', () => {
    const { rerender } = render(<NumberField label="Quantity" description="Between 1 and 8." />);
    expect(screen.getByRole('textbox', { name: 'Quantity' })).toHaveAccessibleDescription('Between 1 and 8.');

    rerender(<NumberField label="Quantity" isInvalid errorMessage="Order at least 1." />);
    expect(screen.getByRole('textbox', { name: 'Quantity' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Order at least 1.')).toBeInTheDocument();
  });

  it('is inert when disabled', async () => {
    render(<NumberField label="Quantity" defaultValue={3} isDisabled />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled();
  });

  it('does not change when read-only', async () => {
    render(<NumberField label="Quantity" defaultValue={3} isReadOnly />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue('3');
  });

  it.each<[string, Partial<NumberFieldProps>]>([
    ['default', { defaultValue: 1 }],
    ['described', { description: 'Helper text.', defaultValue: 1 }],
    ['without steppers', { hideSteppers: true, defaultValue: 1 }],
    ['invalid', { isInvalid: true, errorMessage: 'Too low.', defaultValue: 0 }],
    ['disabled', { isDisabled: true, defaultValue: 1 }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(<NumberField label="Quantity" {...props} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
