import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { TextArea, type TextAreaProps } from './TextArea';

describe('TextArea', () => {
  it('is a labelled multi-line textbox', () => {
    render(<TextArea label="Bio" />);
    const box = screen.getByRole('textbox', { name: 'Bio' });
    expect(box.tagName).toBe('TEXTAREA');
  });

  it('applies rows', () => {
    render(<TextArea label="Bio" rows={6} />);
    expect(screen.getByLabelText('Bio')).toHaveAttribute('rows', '6');
  });

  it('reports typed text, including new lines', async () => {
    const onChange = vi.fn();
    render(<TextArea label="Bio" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Bio'), 'Hi{Enter}there');
    expect(onChange).toHaveBeenLastCalledWith('Hi\nthere');
  });

  it('works as a controlled input', async () => {
    function Controlled() {
      const [value, setValue] = useState('');
      return <TextArea label="Bio" value={value} onChange={setValue} />;
    }
    render(<Controlled />);
    const box = screen.getByLabelText('Bio');
    await userEvent.type(box, 'Grace');
    expect(box).toHaveValue('Grace');
  });

  it('links the description to the field', () => {
    render(<TextArea label="Bio" description="Shown on your profile." />);
    expect(screen.getByLabelText('Bio')).toHaveAccessibleDescription('Shown on your profile.');
  });

  it('shows the error message and marks the field invalid', () => {
    render(<TextArea label="Bio" isInvalid errorMessage="Write more." />);
    const box = screen.getByLabelText('Bio');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription(/Write more\./);
  });

  describe('character count', () => {
    it('counts as you type and enforces the limit', async () => {
      render(<TextArea label="Bio" maxLength={5} />);
      expect(screen.getByText('0 / 5')).toBeInTheDocument();
      const box = screen.getByLabelText('Bio');
      expect(box).toHaveAttribute('maxlength', '5');
      await userEvent.type(box, 'abcdefgh');
      expect(box).toHaveValue('abcde');
      expect(screen.getByText('5 / 5')).toBeInTheDocument();
    });

    it('starts from the default value and follows a controlled value', async () => {
      const { rerender } = render(<TextArea label="Bio" maxLength={20} defaultValue="hello" />);
      expect(screen.getByText('5 / 20')).toBeInTheDocument();
      rerender(<TextArea label="Bio" maxLength={20} value="hello world" onChange={() => {}} />);
      expect(screen.getByText('11 / 20')).toBeInTheDocument();
    });

    it('keeps the counter out of the accessibility tree', () => {
      render(<TextArea label="Bio" maxLength={20} />);
      expect(screen.getByText('0 / 20')).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows no counter without a limit', () => {
      render(<TextArea label="Bio" />);
      expect(screen.queryByText(/\/ /)).not.toBeInTheDocument();
    });
  });

  it('is not editable when disabled', async () => {
    render(<TextArea label="Bio" isDisabled defaultValue="locked" />);
    const box = screen.getByLabelText('Bio');
    expect(box).toBeDisabled();
    await userEvent.type(box, 'x');
    expect(box).toHaveValue('locked');
  });

  it('can be read but not edited when read-only', async () => {
    render(<TextArea label="Bio" isReadOnly defaultValue="fixed" />);
    const box = screen.getByLabelText('Bio');
    await userEvent.type(box, 'x');
    expect(box).toHaveValue('fixed');
  });

  it('turns on content-based sizing for autoGrow and disables the manual handle', () => {
    render(<TextArea label="Bio" autoGrow />);
    const box = screen.getByLabelText('Bio');
    expect(box.className).toContain('field-sizing-content');
    expect(box.className).toContain('resize-none');
  });

  it.each<[string, Partial<TextAreaProps>]>([
    ['default', {}],
    ['described', { description: 'Helper text.' }],
    ['with a counter', { maxLength: 100, defaultValue: 'abc' }],
    ['invalid', { isInvalid: true, errorMessage: 'Required.' }],
    ['disabled', { isDisabled: true }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(<TextArea label="Bio" {...props} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
